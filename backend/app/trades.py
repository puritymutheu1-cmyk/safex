from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn
from app.deps import current_user
from app.wallet import log, credit

router = APIRouter(prefix="/trades", tags=["trades"])


class TradeIn(BaseModel):
    offer_id: int
    amount_kes: float


@router.post("")
def start_trade(data: TradeIn, user=Depends(current_user)):
    conn = get_conn()
    offer = conn.execute(
        "SELECT * FROM offers WHERE id = ? AND active = 1", (data.offer_id,)
    ).fetchone()
    if not offer:
        conn.close()
        raise HTTPException(status_code=404, detail="Offer not found")
    if offer["seller_id"] == user["id"]:
        conn.close()
        raise HTTPException(status_code=400, detail="You cannot buy your own offer")
    if not (offer["min_kes"] <= data.amount_kes <= offer["max_kes"]):
        conn.close()
        raise HTTPException(
            status_code=400,
            detail=f"Amount must be between {offer['min_kes']:.0f} and {offer['max_kes']:.0f} KES",
        )
    coins = round(data.amount_kes / offer["price"], 8)
    cur = conn.execute(
        "UPDATE offers SET remaining = remaining - ? "
        "WHERE id = ? AND active = 1 AND remaining + 0.000000001 >= ?",
        (coins, offer["id"], coins),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=400, detail="This offer does not have enough left. Try a smaller amount.")
    cur = conn.execute(
        "INSERT INTO trades (offer_id, buyer_id, seller_id, coin, amount_kes, amount_coin) "
        "VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
        (offer["id"], user["id"], offer["seller_id"], offer["coin"], data.amount_kes, coins),
    )
    trade_id = cur.fetchone()["id"]
    conn.commit()
    conn.close()
    return {
        "id": trade_id,
        "amount_coin": coins,
        "status": "pending",
        "method": offer["method"],
        "payment_details": offer["payment_details"],
    }


@router.get("/mine")
def my_trades(user=Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT t.*, b.name AS buyer, s.name AS seller, o.method, o.payment_details "
        "FROM trades t JOIN users b ON b.id = t.buyer_id "
        "JOIN users s ON s.id = t.seller_id JOIN offers o ON o.id = t.offer_id "
        "WHERE t.buyer_id = ? OR t.seller_id = ? ORDER BY t.id DESC",
        (user["id"], user["id"]),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def load_trade(conn, trade_id):
    t = conn.execute("SELECT * FROM trades WHERE id = ?", (trade_id,)).fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Trade not found")
    return t


def set_status(conn, trade_id, from_status, to_status):
    cur = conn.execute(
        "UPDATE trades SET status = ? WHERE id = ? AND status = ?",
        (to_status, trade_id, from_status),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=400, detail="This trade can no longer be changed")


@router.post("/{trade_id}/paid")
def mark_paid(trade_id: int, user=Depends(current_user)):
    conn = get_conn()
    t = load_trade(conn, trade_id)
    if t["buyer_id"] != user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Only the buyer can do this")
    set_status(conn, trade_id, "pending", "paid")
    conn.commit()
    conn.close()
    return {"status": "paid"}


@router.post("/{trade_id}/release")
def release(trade_id: int, user=Depends(current_user)):
    conn = get_conn()
    t = load_trade(conn, trade_id)
    if t["seller_id"] != user["id"]:
        conn.close()
        raise HTTPException(status_code=403, detail="Only the seller can release the crypto")
    set_status(conn, trade_id, "paid", "completed")
    coin, amount = t["coin"], t["amount_coin"]
    cur = conn.execute(
        "UPDATE wallets SET locked = locked - ? "
        "WHERE user_id = ? AND asset = ? AND locked + 0.000000001 >= ?",
        (amount, t["seller_id"], coin, amount),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=500, detail="Escrow error. Nothing was changed.")
    credit(conn, t["buyer_id"], coin, amount)
    log(conn, t["seller_id"], "release", coin, amount, "Released to the buyer")
    log(conn, t["buyer_id"], "buy", coin, amount, "Trade completed")
    conn.commit()
    conn.close()
    return {"status": "completed"}


@router.post("/{trade_id}/cancel")
def cancel(trade_id: int, user=Depends(current_user)):
    conn = get_conn()
    t = load_trade(conn, trade_id)
    if user["id"] not in (t["buyer_id"], t["seller_id"]):
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")
    set_status(conn, trade_id, "pending", "cancelled")
    offer = conn.execute(
        "SELECT active FROM offers WHERE id = ?", (t["offer_id"],)
    ).fetchone()
    if offer and offer["active"] == 1:
        conn.execute(
            "UPDATE offers SET remaining = remaining + ? WHERE id = ?",
            (t["amount_coin"], t["offer_id"]),
        )
    else:
        conn.execute(
            "UPDATE wallets SET available = available + ?, locked = locked - ? "
            "WHERE user_id = ? AND asset = ?",
            (t["amount_coin"], t["amount_coin"], t["seller_id"], t["coin"]),
        )
        log(conn, t["seller_id"], "unlock", t["coin"], t["amount_coin"], "Trade cancelled")
    conn.commit()
    conn.close()
    return {"status": "cancelled"}
