from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn
from app.deps import current_user

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
        "INSERT INTO trades (offer_id, buyer_id, seller_id, coin, amount_kes, amount_coin) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (offer["id"], user["id"], offer["seller_id"], offer["coin"], data.amount_kes, coins),
    )
    conn.commit()
    trade_id = cur.lastrowid
    conn.close()
    return {"id": trade_id, "amount_coin": coins, "status": "pending"}


@router.get("/mine")
def my_trades(user=Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT t.*, b.name AS buyer, s.name AS seller FROM trades t "
        "JOIN users b ON b.id = t.buyer_id JOIN users s ON s.id = t.seller_id "
        "WHERE t.buyer_id = ? OR t.seller_id = ? ORDER BY t.id DESC",
        (user["id"], user["id"]),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def move(trade_id, user, roles, from_status, to_status):
    conn = get_conn()
    t = conn.execute("SELECT * FROM trades WHERE id = ?", (trade_id,)).fetchone()
    if not t:
        conn.close()
        raise HTTPException(status_code=404, detail="Trade not found")
    allowed = []
    if "buyer" in roles:
        allowed.append(t["buyer_id"])
    if "seller" in roles:
        allowed.append(t["seller_id"])
    if user["id"] not in allowed:
        conn.close()
        raise HTTPException(status_code=403, detail="Not allowed")
    if t["status"] != from_status:
        conn.close()
        raise HTTPException(status_code=400, detail="Trade is already " + t["status"])
    conn.execute("UPDATE trades SET status = ? WHERE id = ?", (to_status, trade_id))
    conn.commit()
    conn.close()
    return {"status": to_status}


@router.post("/{trade_id}/paid")
def mark_paid(trade_id: int, user=Depends(current_user)):
    return move(trade_id, user, ["buyer"], "pending", "paid")


@router.post("/{trade_id}/release")
def release(trade_id: int, user=Depends(current_user)):
    return move(trade_id, user, ["seller"], "paid", "completed")


@router.post("/{trade_id}/cancel")
def cancel(trade_id: int, user=Depends(current_user)):
    return move(trade_id, user, ["buyer", "seller"], "pending", "cancelled")
