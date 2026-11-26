from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn
from app.deps import current_user
from app.wallet import log

router = APIRouter(prefix="/offers", tags=["offers"])
COINS = set(["BTC", "ETH", "USDT", "USDC", "SOL", "BNB", "XRP", "LTC"])
METHODS = {"M-Pesa", "Airtel Money", "Bank transfer"}


class OfferIn(BaseModel):
    coin: str
    price: float
    amount: float
    min_kes: float
    max_kes: float
    method: str
    payment_details: str


@router.get("")
def list_offers(coin: Optional[str] = None):
    sql = (
        "SELECT o.id, o.coin, o.price, o.remaining, o.min_kes, o.max_kes, o.method, "
        "o.seller_id, u.name AS seller FROM offers o "
        "JOIN users u ON u.id = o.seller_id WHERE o.active = 1 AND o.remaining > 0"
    )
    args = []
    if coin and coin.upper() != "ALL":
        sql += " AND o.coin = ?"
        args.append(coin.upper())
    conn = get_conn()
    rows = conn.execute(sql + " ORDER BY o.id DESC", args).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.get("/mine")
def my_offers(user=Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, coin, price, amount, remaining, min_kes, max_kes, method, "
        "payment_details FROM offers WHERE seller_id = ? AND active = 1 ORDER BY id DESC",
        (user["id"],),
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("")
def create_offer(data: OfferIn, user=Depends(current_user)):
    coin = data.coin.upper()
    amount = round(data.amount, 8)
    if coin not in COINS:
        raise HTTPException(status_code=400, detail="Coin must be BTC, ETH or USDT")
    if data.method not in METHODS:
        raise HTTPException(status_code=400, detail="Choose a payment method")
    if data.price <= 0 or amount <= 0:
        raise HTTPException(status_code=400, detail="Price and amount must be above zero")
    if data.min_kes <= 0 or data.max_kes < data.min_kes:
        raise HTTPException(status_code=400, detail="Check your minimum and maximum")
    if len(data.payment_details.strip()) < 5:
        raise HTTPException(status_code=400, detail="Add your payment details so buyers can pay you")
    conn = get_conn()
    cur = conn.execute(
        "UPDATE wallets SET available = available - ?, locked = locked + ? "
        "WHERE user_id = ? AND asset = ? AND available + 0.000000001 >= ?",
        (amount, amount, user["id"], coin, amount),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Not enough " + coin + " in your wallet. Deposit some first.",
        )
    conn.execute(
        "INSERT INTO offers (seller_id, coin, price, amount, remaining, min_kes, "
        "max_kes, method, payment_details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (user["id"], coin, data.price, amount, amount, data.min_kes,
         data.max_kes, data.method, data.payment_details.strip()),
    )
    log(conn, user["id"], "lock", coin, amount, "Locked for a new offer")
    conn.commit()
    conn.close()
    return {"message": "Offer created"}


@router.delete("/{offer_id}")
def close_offer(offer_id: int, user=Depends(current_user)):
    conn = get_conn()
    offer = conn.execute(
        "SELECT * FROM offers WHERE id = ? AND seller_id = ? AND active = 1",
        (offer_id, user["id"]),
    ).fetchone()
    if not offer:
        conn.close()
        raise HTTPException(status_code=404, detail="Offer not found")
    left = offer["remaining"]
    conn.execute("UPDATE offers SET active = 0, remaining = 0 WHERE id = ?", (offer_id,))
    conn.execute(
        "UPDATE wallets SET available = available + ?, locked = locked - ? "
        "WHERE user_id = ? AND asset = ?",
        (left, left, user["id"], offer["coin"]),
    )
    log(conn, user["id"], "unlock", offer["coin"], left, "Offer closed")
    conn.commit()
    conn.close()
    return {"message": "Offer closed and your crypto is back in your wallet"}
