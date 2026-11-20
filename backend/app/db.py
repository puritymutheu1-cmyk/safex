import os
import sqlite3

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    import psycopg2
    import psycopg2.extras

    IntegrityError = psycopg2.IntegrityError
    PK = "SERIAL PRIMARY KEY"
else:
    IntegrityError = sqlite3.IntegrityError
    PK = "INTEGER PRIMARY KEY AUTOINCREMENT"


class Conn:
    def __init__(self, raw):
        self.raw = raw

    def execute(self, sql, args=()):
        if DATABASE_URL:
            cur = self.raw.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute(sql.replace("?", "%s"), tuple(args))
            return cur
        return self.raw.execute(sql, args)

    def commit(self):
        self.raw.commit()

    def close(self):
        self.raw.close()


def get_conn():
    if DATABASE_URL:
        return Conn(psycopg2.connect(DATABASE_URL))
    raw = sqlite3.connect("safex.db")
    raw.row_factory = sqlite3.Row
    return Conn(raw)


def init_db():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS users (
            id {PK},
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        )"""
    )
    conn.commit()
    conn.close()


def init_trades_db():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS offers (
            id {PK},
            seller_id INTEGER NOT NULL,
            coin TEXT NOT NULL,
            price DOUBLE PRECISION NOT NULL,
            min_kes DOUBLE PRECISION NOT NULL,
            max_kes DOUBLE PRECISION NOT NULL,
            method TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        )"""
    )
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS trades (
            id {PK},
            offer_id INTEGER NOT NULL,
            buyer_id INTEGER NOT NULL,
            seller_id INTEGER NOT NULL,
            coin TEXT NOT NULL,
            amount_kes DOUBLE PRECISION NOT NULL,
            amount_coin DOUBLE PRECISION NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
        )"""
    )
    conn.commit()
    conn.close()


def add_column(table, column, decl):
    conn = get_conn()
    try:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {decl}")
        conn.commit()
    except Exception:
        try:
            conn.raw.rollback()
        except Exception:
            pass
    finally:
        conn.close()


def init_wallet_db():
    conn = get_conn()
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS wallets (
            id {PK},
            user_id INTEGER NOT NULL,
            asset TEXT NOT NULL,
            available DOUBLE PRECISION NOT NULL DEFAULT 0,
            locked DOUBLE PRECISION NOT NULL DEFAULT 0,
            UNIQUE (user_id, asset)
        )"""
    )
    conn.execute(
        f"""CREATE TABLE IF NOT EXISTS transactions (
            id {PK},
            user_id INTEGER NOT NULL,
            kind TEXT NOT NULL,
            asset TEXT NOT NULL,
            amount DOUBLE PRECISION NOT NULL,
            note TEXT,
            created_ts DOUBLE PRECISION NOT NULL
        )"""
    )
    conn.commit()
    conn.close()
    add_column("offers", "amount", "DOUBLE PRECISION NOT NULL DEFAULT 0")
    add_column("offers", "remaining", "DOUBLE PRECISION NOT NULL DEFAULT 0")
    add_column("offers", "payment_details", "TEXT")
    conn = get_conn()
    conn.execute("UPDATE offers SET active = 0 WHERE amount = 0")
    conn.commit()
    conn.close()
