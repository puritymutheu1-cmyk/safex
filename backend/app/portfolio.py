import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn, PK
from app.deps import current_user
from app.wallet import log, credit

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

# Demo prices in USD. Fixed on purpose: this is a simulation, not live market data.
USD = {"BTC": 65000.0, "ETH": 3000.0, "USDT": 1.0, "KES": 1 / 129.0}
CRYPTO = ["BTC", "ETH", "USDT"]
SPOT_ASSETS = ["BTC", "ETH", "USDT", "KES"]
EPS = 0.000000001


def ensure():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS spot_wallets (
            id {PK},
            user_id INTEGER NOT NULL,
            asset TEXT NOT NULL,
            available DOUBLE PRECISION NOT NULL DEFAULT 0,
            UNIQUE (user_id, asset)
        )"""
    )
    conn.commit()
    conn.close()


def spot_credit(conn, user_id, asset, amount):
    conn.execute(
        "INSERT INTO spot_wallets (user_id, asset, available) VALUES (?, ?, ?) "
        "ON CONFLICT (user_id, asset) DO UPDATE SET available = spot_wallets.available + ?",
        (user_id, asset, amount, amount),
    )


def status_of(kind, created_ts):
    # Simulated status: new deposits "confirming" for 30s, withdrawals "processing" for 2 min.
    age = time.time() - created_ts
    if kind == "deposit" and age < 30:
        return "confirming"
    if kind == "withdraw" and age < 120:
        return "processing"
    return "completed"


class TransferIn(BaseModel):
    asset: str
    amount: float
    direction: str  # to_spot or to_funding


class ConvertIn(BaseModel):
    from_asset: str
    to_asset: str
    amount: float


@router.get("/rates")
def rates():
    return {"usd": USD, "kes_per_usd": 129.0, "demo": True}


@router.get("")
def overview(user=Depends(current_user)):
    ensure()
    uid = user["id"]
    conn = get_conn()
    fund = conn.execute(
        "SELECT asset, available, locked FROM wallets WHERE user_id = ?", (uid,)
    ).fetchall()
    spot = conn.execute(
        "SELECT asset, available FROM spot_wallets WHERE user_id = ?", (uid,)
    ).fetchall()
    txs = conn.execute(
        "SELECT kind, asset, amount FROM transactions WHERE user_id = ?", (uid,)
    ).fetchall()
    conn.close()
    f = {r["asset"]: r for r in fund}
    s = {r["asset"]: r["available"] for r in spot}
    funding = [
        {"asset": a, "available": f[a]["available"] if a in f else 0,
         "locked": f[a]["locked"] if a in f else 0}
        for a in CRYPTO
    ]
    spotl = [{"asset": a, "available": s.get(a, 0)} for a in SPOT_ASSETS]
    per = {a: 0.0 for a in SPOT_ASSETS}
    for r in funding:
        per[r["asset"]] += (r["available"] + r["locked"]) * USD[r["asset"]]
    for r in spotl:
        per[r["asset"]] += r["available"] * USD[r["asset"]]
    total = sum(per.values())
    alloc = [
        {"asset": a, "usd": round(v, 2), "pct": round(v / total * 100, 1) if total else 0}
        for a, v in per.items() if v > 0
    ]
    stats = {"deposits": 0, "withdrawals": 0, "conversions": 0, "transfers": 0}
    for t in txs:
        if t["kind"] == "deposit":
            stats["deposits"] += 1
        elif t["kind"] == "withdraw":
            stats["withdrawals"] += 1
        elif t["kind"] == "convert":
            stats["conversions"] += 1
        elif t["kind"] == "transfer":
            stats["transfers"] += 1
    return {
        "funding": funding, "spot": spotl, "total_usd": round(total, 2),
        "total_kes": round(total * 129.0, 2), "allocation": alloc,
        "stats": stats, "demo": True,
    }


@router.post("/transfer")
def transfer(data: TransferIn, user=Depends(current_user)):
    ensure()
    asset = data.asset.upper()
    if asset not in CRYPTO:
        raise HTTPException(status_code=400, detail="Only BTC, ETH and USDT can be moved")
    if data.direction not in ("to_spot", "to_funding"):
        raise HTTPException(status_code=400, detail="Bad direction")
    amount = round(data.amount, 8)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Enter an amount above 0")
    uid = user["id"]
    conn = get_conn()
    if data.direction == "to_spot":
        cur = conn.execute(
            "UPDATE wallets SET available = available - ? "
            "WHERE user_id = ? AND asset = ? AND available + ? >= ?",
            (amount, uid, asset, EPS, amount),
        )
    else:
        cur = conn.execute(
            "UPDATE spot_wallets SET available = available - ? "
            "WHERE user_id = ? AND asset = ? AND available + ? >= ?",
            (amount, uid, asset, EPS, amount),
        )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=400, detail="Not enough available balance")
    if data.direction == "to_spot":
        spot_credit(conn, uid, asset, amount)
        note = "Funding to Spot"
    else:
        credit(conn, uid, asset, amount)
        note = "Spot to Funding"
    log(conn, uid, "transfer", asset, amount, note)
    conn.commit()
    conn.close()
    return {"message": f"Moved {amount} {asset}. " + note}


@router.post("/convert")
def convert(data: ConvertIn, user=Depends(current_user)):
    ensure()
    a, b = data.from_asset.upper(), data.to_asset.upper()
    if a not in SPOT_ASSETS or b not in SPOT_ASSETS or a == b:
        raise HTTPException(status_code=400, detail="Pick two different coins")
    amount = round(data.amount, 8)
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Enter an amount above 0")
    got = round(amount * USD[a] / USD[b], 8)
    if got <= 0:
        raise HTTPException(status_code=400, detail="Amount too small")
    uid = user["id"]
    conn = get_conn()
    cur = conn.execute(
        "UPDATE spot_wallets SET available = available - ? "
        "WHERE user_id = ? AND asset = ? AND available + ? >= ?",
        (amount, uid, a, EPS, amount),
    )
    if cur.rowcount != 1:
        conn.close()
        raise HTTPException(status_code=400, detail="Not enough in your Spot wallet. Move funds from Funding first.")
    spot_credit(conn, uid, b, got)
    log(conn, uid, "convert", a, amount, f"{amount} {a} -> {got} {b} (demo rate)")
    conn.commit()
    conn.close()
    return {"message": f"Converted {amount} {a} to {got} {b}", "received": got}


@router.get("/history")
def history(kind: str = "", user=Depends(current_user)):
    uid = user["id"]
    conn = get_conn()
    if kind:
        rows = conn.execute(
            "SELECT id, kind, asset, amount, note, created_ts FROM transactions "
            "WHERE user_id = ? AND kind = ? ORDER BY id DESC LIMIT 100", (uid, kind)
        ).fetchall()
    else:
        rows = conn.execute(
            "SELECT id, kind, asset, amount, note, created_ts FROM transactions "
            "WHERE user_id = ? ORDER BY id DESC LIMIT 100", (uid,)
        ).fetchall()
    conn.close()
    out = []
    for r in rows:
        d = dict(r)
        d["status"] = status_of(d["kind"], d["created_ts"])
        out.append(d)
    return {"items": out}
