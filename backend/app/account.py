import time
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.db import get_conn, PK
from app.deps import current_user
from app.security import hash_password, verify_password

router = APIRouter(prefix="/account", tags=["account"])
METHODS = {"M-Pesa", "Airtel Money", "Bank transfer"}
CURRENCIES = {"USD", "KES"}


def ensure():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS payment_methods (
            id {PK},
            user_id INTEGER NOT NULL,
            method TEXT NOT NULL,
            details TEXT NOT NULL,
            created_ts DOUBLE PRECISION NOT NULL
        )"""
    )
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS user_settings (
            id {PK},
            user_id INTEGER UNIQUE NOT NULL,
            currency TEXT NOT NULL DEFAULT 'USD'
        )"""
    )
    conn.commit()
    conn.close()


class MethodIn(BaseModel):
    method: str
    details: str


class SettingsIn(BaseModel):
    name: str
    currency: str


class PasswordIn(BaseModel):
    current_password: str
    new_password: str


@router.get("/payment-methods")
def list_methods(user=Depends(current_user)):
    ensure()
    conn = get_conn()
    rows = conn.execute(
        "SELECT id, method, details FROM payment_methods WHERE user_id = ? ORDER BY id DESC",
        (user["id"],),
    ).fetchall()
    conn.close()
    return {"items": [dict(r) for r in rows], "methods": sorted(METHODS)}


@router.post("/payment-methods")
def add_method(data: MethodIn, user=Depends(current_user)):
    ensure()
    if data.method not in METHODS:
        raise HTTPException(status_code=400, detail="Pick M-Pesa, Airtel Money or Bank transfer")
    details = data.details.strip()
    if len(details) < 5 or len(details) > 200:
        raise HTTPException(status_code=400, detail="Details must be 5 to 200 characters")
    conn = get_conn()
    n = conn.execute(
        "SELECT COUNT(*) AS c FROM payment_methods WHERE user_id = ?", (user["id"],)
    ).fetchone()["c"]
    if n >= 5:
        conn.close()
        raise HTTPException(status_code=400, detail="You can save up to 5 payment methods")
    conn.execute(
        "INSERT INTO payment_methods (user_id, method, details, created_ts) VALUES (?, ?, ?, ?)",
        (user["id"], data.method, details, time.time()),
    )
    conn.commit()
    conn.close()
    return {"message": "Payment method saved"}


@router.delete("/payment-methods/{pm_id}")
def delete_method(pm_id: int, user=Depends(current_user)):
    ensure()
    conn = get_conn()
    cur = conn.execute(
        "DELETE FROM payment_methods WHERE id = ? AND user_id = ?", (pm_id, user["id"])
    )
    conn.commit()
    conn.close()
    if cur.rowcount != 1:
        raise HTTPException(status_code=404, detail="Not found")
    return {"message": "Payment method removed"}


@router.get("/settings")
def get_settings(user=Depends(current_user)):
    ensure()
    conn = get_conn()
    row = conn.execute(
        "SELECT currency FROM user_settings WHERE user_id = ?", (user["id"],)
    ).fetchone()
    conn.close()
    return {"name": user["name"], "email": user["email"],
            "currency": row["currency"] if row else "USD"}


@router.put("/settings")
def save_settings(data: SettingsIn, user=Depends(current_user)):
    ensure()
    name = data.name.strip()
    if len(name) < 2 or len(name) > 60:
        raise HTTPException(status_code=400, detail="Name must be 2 to 60 characters")
    if data.currency not in CURRENCIES:
        raise HTTPException(status_code=400, detail="Currency must be USD or KES")
    conn = get_conn()
    conn.execute("UPDATE users SET name = ? WHERE id = ?", (name, user["id"]))
    conn.execute(
        "INSERT INTO user_settings (user_id, currency) VALUES (?, ?) "
        "ON CONFLICT (user_id) DO UPDATE SET currency = ?",
        (user["id"], data.currency, data.currency),
    )
    conn.commit()
    conn.close()
    return {"message": "Settings saved"}


@router.post("/change-password")
def change_password(data: PasswordIn, user=Depends(current_user)):
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    conn = get_conn()
    row = conn.execute("SELECT password FROM users WHERE id = ?", (user["id"],)).fetchone()
    if not row or not verify_password(data.current_password, row["password"]):
        conn.close()
        raise HTTPException(status_code=400, detail="Current password is wrong")
    conn.execute(
        "UPDATE users SET password = ? WHERE id = ?",
        (hash_password(data.new_password), user["id"]),
    )
    conn.commit()
    conn.close()
    return {"message": "Password changed"}
