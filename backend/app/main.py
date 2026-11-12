import os
import sqlite3
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.db import get_conn, init_db, init_trades_db, IntegrityError
from app.security import hash_password, verify_password, create_token
from app.deps import current_user
from app import offers, trades

app = FastAPI(title="Safex API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "")],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):5173",
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()
init_trades_db()
app.include_router(offers.router)
app.include_router(trades.router)


class RegisterIn(BaseModel):
    name: str
    email: str
    password: str


class LoginIn(BaseModel):
    email: str
    password: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/auth/register")
def register(data: RegisterIn):
    conn = get_conn()
    try:
        conn.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (data.name, data.email.lower(), hash_password(data.password)),
        )
        conn.commit()
    except IntegrityError:
        raise HTTPException(status_code=400, detail="Email already registered")
    finally:
        conn.close()
    return {"message": "Account created"}


@app.post("/auth/login")
def login(data: LoginIn):
    conn = get_conn()
    user = conn.execute(
        "SELECT * FROM users WHERE email = ?", (data.email.lower(),)
    ).fetchone()
    conn.close()
    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Wrong email or password")
    return {"access_token": create_token(user["id"]), "token_type": "bearer"}


@app.get("/auth/me")
def me(user=Depends(current_user)):
    return user
