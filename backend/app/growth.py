import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn, PK, IntegrityError
from app.deps import current_user
from app.wallet import log, credit

router = APIRouter(prefix="/growth", tags=["growth"])

REFERRER_BONUS = 5.0   # demo USDT
NEW_USER_BONUS = 2.0   # demo USDT
MAX_REFERRALS = 10
DOC_TYPES = {"National ID", "Passport", "Driving licence"}
VERIFY_AFTER = 60      # seconds, simulated review time


def ensure():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS referrals (
            id {PK},
            referrer_id INTEGER NOT NULL,
            referred_id INTEGER UNIQUE NOT NULL,
            created_ts DOUBLE PRECISION NOT NULL
        )"""
    )
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS verifications (
            id {PK},
            user_id INTEGER UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            country TEXT NOT NULL,
            doc_type TEXT NOT NULL,
            submitted_ts DOUBLE PRECISION NOT NULL
        )"""
    )
    conn.commit()
    conn.close()


def code_for(user_id):
    return "SFX" + str(user_id * 37 + 4093)


def user_from_code(code):
    code = code.strip().upper()
    if not code.startswith("SFX") or not code[3:].isdigit():
        return None
    n = int(code[3:]) - 4093
    if n <= 0 or n % 37 != 0:
        return None
    return n // 37


class ApplyIn(BaseModel):
    code: str


class VerifyIn(BaseModel):
    full_name: str
    country: str
    doc_type: str


@router.get("/referral")
def referral(user=Depends(current_user)):
    ensure()
    conn = get_conn()
    mine = conn.execute(
        "SELECT r.created_ts, u.name FROM referrals r JOIN users u ON u.id = r.referred_id "
        "WHERE r.referrer_id = ? ORDER BY r.id DESC", (user["id"],)
    ).fetchall()
    used = conn.execute(
        "SELECT referrer_id FROM referrals WHERE referred_id = ?", (user["id"],)
    ).fetchone()
    conn.close()
    return {
        "code": code_for(user["id"]),
        "count": len(mine),
        "earned_usdt": len(mine) * REFERRER_BONUS,
        "limit": MAX_REFERRALS,
        "referrer_bonus": REFERRER_BONUS,
        "new_user_bonus": NEW_USER_BONUS,
        "friends": [{"name": r["name"], "created_ts": r["created_ts"]} for r in mine],
        "already_used_code": bool(used),
        "demo": True,
    }


@router.post("/referral/apply")
def apply_code(data: ApplyIn, user=Depends(current_user)):
    ensure()
    ref = user_from_code(data.code)
    if not ref:
        raise HTTPException(status_code=400, detail="That code is not valid")
    if ref == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot use your own code")
    conn = get_conn()
    owner = conn.execute("SELECT id FROM users WHERE id = ?", (ref,)).fetchone()
    if not owner:
        conn.close()
        raise HTTPException(status_code=400, detail="That code is not valid")
    n = conn.execute(
        "SELECT COUNT(*) AS c FROM referrals WHERE referrer_id = ?", (ref,)
    ).fetchone()["c"]
    if n >= MAX_REFERRALS:
        conn.close()
        raise HTTPException(status_code=400, detail="This code has reached its limit")
    try:
        conn.execute(
            "INSERT INTO referrals (referrer_id, referred_id, created_ts) VALUES (?, ?, ?)",
            (ref, user["id"], time.time()),
        )
    except IntegrityError:
        try:
            conn.raw.rollback()
        except Exception:
            pass
        conn.close()
        raise HTTPException(status_code=400, detail="You have already used a referral code")
    credit(conn, ref, "USDT", REFERRER_BONUS)
    log(conn, ref, "reward", "USDT", REFERRER_BONUS, "Referral reward (demo)")
    credit(conn, user["id"], "USDT", NEW_USER_BONUS)
    log(conn, user["id"], "reward", "USDT", NEW_USER_BONUS, "Welcome bonus (demo)")
    conn.commit()
    conn.close()
    return {"message": f"Code applied. You received {NEW_USER_BONUS} demo USDT in your Wallet."}


def status_of(ts):
    return "verified" if time.time() - ts >= VERIFY_AFTER else "pending"


@router.get("/verification")
def get_verification(user=Depends(current_user)):
    ensure()
    conn = get_conn()
    row = conn.execute(
        "SELECT full_name, country, doc_type, submitted_ts FROM verifications WHERE user_id = ?",
        (user["id"],),
    ).fetchone()
    conn.close()
    if not row:
        return {"status": "unverified", "doc_types": sorted(DOC_TYPES), "demo": True}
    d = dict(row)
    d["status"] = status_of(d["submitted_ts"])
    d["demo"] = True
    return d


@router.post("/verification")
def submit_verification(data: VerifyIn, user=Depends(current_user)):
    ensure()
    name, country = data.full_name.strip(), data.country.strip()
    if len(name) < 3 or len(name) > 80:
        raise HTTPException(status_code=400, detail="Enter your full name")
    if len(country) < 2 or len(country) > 60:
        raise HTTPException(status_code=400, detail="Enter your country")
    if data.doc_type not in DOC_TYPES:
        raise HTTPException(status_code=400, detail="Pick a document type")
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO verifications (user_id, full_name, country, doc_type, submitted_ts) "
            "VALUES (?, ?, ?, ?, ?)", (user["id"], name, country, data.doc_type, time.time()),
        )
    except IntegrityError:
        try:
            conn.raw.rollback()
        except Exception:
            pass
        conn.close()
        raise HTTPException(status_code=400, detail="You already submitted verification")
    conn.commit()
    conn.close()
    return {"message": "Submitted. Demo review takes about a minute."}
