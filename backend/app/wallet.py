import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn
from app.deps import current_user

router = APIRouter(prefix="/wallet", tags=["wallet"])
ASSETS = ["BTC", "ETH", "USDT"]
DEMO_DEPOSIT_MAX = {"BTC": 0.05, "ETH": 1.0, "USDT": 1000.0}


def log(conn, user_id, kind, asset, amount, note=""):
    conn.execute(
        "INSERT INTO transactions (user_id, kind, asset, amount, note, created_ts) "
        "VALUES (?, ?, ?, ?, ?, ?)",
        (user_id, kind, asset, amount, note, time.time()),
    )


def credit(conn, user_id, asset, amount):
    conn.execute(
        "INSERT INTO wallets (user_id, asset, available, locked) VALUES (?, ?, ?, 0) "
        "ON CONFLICT (user_id, asset) DO UPDATE SET available = wallets.available + ?",
        (user_id, asset, amount, amount),
    )


class DepositIn(BaseModel):
    asset: str
    amount: float


class WithdrawIn(BaseModel):
    asset: str
    amount: float
    address: str


@router.get("")
def my_wallet(user=Depends(current_user)):
    conn = get_conn()
    rows = conn.execute(
        "SELECT asset, available, locked FROM wallets WHERE user_id = ?", (user["id"],)
    ).fetchall()
    txs = conn.execute(
        "SELECT kind, asset, amount, note, created_ts FROM transactions "
        "WHERE user_id = ? ORDER BY id DESC LIMIT 20",
        (user["id"],),
    ).fetchall()
    conn.close()
    have = {r["asset"]: dict(r) for r in rows}
    balances = [have.get(a, {"asset": a, "available": 0, "locked": 0}) for a in ASSETS]
    return {"balances": balances, "transactions": [dict(t) for t in txs], "demo": True}


@router.post("/deposit")
def deposit(data: DepositIn, user=Depends(current_user)):
    asset = data.asset.upper()
    if asset not in ASSETS:
        raise HTTPException(status_code=400, detail="Choose BTC, ETH or USDT")
    limit = DEMO_DEPOSIT_MAX[asset]
    if data.amount <= 0 or data.amount > limit:
        raise HTTPException(
            status_code=400,
            detail=f"Demo deposits are limited to {limit} {asset} at a time",
        )
    amount = round(data.amount, 8)
    conn = get_conn()
    credit(conn, user["id"], asset, amount)
    log(conn, user["id"], "deposit", asset, amount, "Demo deposit")
    conn.commit()
    conn.close()
    return {"message": "Demo deposit added"}


@router.post("/withdraw")
def withdraw(data: WithdrawIn, user=Depends(current_user)):
    asset = data.asset.upper()
    amount = round(data.amount, 8)
    address = data.address.strip()
    if asset not in ASSETS:
        raise HTTPException(status_code=400, detail="Choose BTC, ETH or USDT")
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Enter an amount above zero")
    if len(address) < 10:
        raise HTTPException(status_code=400, detail="Enter a valid wallet address")
    conn = get_conn()
    cur = conn.execute(
        "UPDATE wallets SET available = available - ? "
        "WHERE user_id = ? AND asset = ? AND available + 0.000000001 >= ?",
        (amount, user["id"], asset, amount),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=400, detail="Not enough available balance")
    note = "To " + address[:6] + "..." + address[-4:] + " (simulated)"
    log(conn, user["id"], "withdraw", asset, amount, note)
    conn.commit()
    conn.close()
    return {"message": "Withdrawal recorded. This is a demo, so nothing was sent."}
