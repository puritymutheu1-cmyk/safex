from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn
from app.deps import current_user

router = APIRouter(prefix="/offers", tags=["offers"])
COINS = {"BTC", "ETH", "USDT"}


class OfferIn(BaseModel):
    coin: str
    price: float
    min_kes: float
    max_kes: float
    method: str


@router.get("")
def list_offers(coin: Optional[str] = None):
    sql = (
        "SELECT o.id, o.coin, o.price, o.min_kes, o.max_kes, o.method, "
        "o.seller_id, u.name AS seller FROM offers o "
        "JOIN users u ON u.id = o.seller_id WHERE o.active = 1"
    )
    args = []
    if coin and coin.upper() != "ALL":
        sql += " AND o.coin = ?"
        args.append(coin.upper())
    conn = get_conn()
    rows = conn.execute(sql + " ORDER BY o.id DESC", args).fetchall()
    conn.close()
    return [dict(r) for r in rows]


@router.post("")
def create_offer(data: OfferIn, user=Depends(current_user)):
    coin = data.coin.upper()
    if coin not in COINS:
        raise HTTPException(status_code=400, detail="Coin must be BTC, ETH or USDT")
    if data.price <= 0 or data.min_kes <= 0 or data.max_kes < data.min_kes:
        raise HTTPException(status_code=400, detail="Check your price and limits")
    conn = get_conn()
    conn.execute(
        "INSERT INTO offers (seller_id, coin, price, min_kes, max_kes, method) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (user["id"], coin, data.price, data.min_kes, data.max_kes, data.method),
    )
    conn.commit()
    conn.close()
    return {"message": "Offer created"}


@router.delete("/{offer_id}")
def close_offer(offer_id: int, user=Depends(current_user)):
    conn = get_conn()
    conn.execute(
        "UPDATE offers SET active = 0 WHERE id = ? AND seller_id = ?",
        (offer_id, user["id"]),
    )
    conn.commit()
    conn.close()
    return {"message": "Offer closed"}
