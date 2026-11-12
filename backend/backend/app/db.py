import sqlite3


def get_conn():
    conn = sqlite3.connect("safex.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        """CREATE TABLE IF NOT EXISTS offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seller_id INTEGER NOT NULL,
            coin TEXT NOT NULL,
            price REAL NOT NULL,
            min_kes REAL NOT NULL,
            max_kes REAL NOT NULL,
            method TEXT NOT NULL,
            active INTEGER NOT NULL DEFAULT 1
        )"""
    )
    conn.execute(
        """CREATE TABLE IF NOT EXISTS trades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            offer_id INTEGER NOT NULL,
            buyer_id INTEGER NOT NULL,
            seller_id INTEGER NOT NULL,
            coin TEXT NOT NULL,
            amount_kes REAL NOT NULL,
            amount_coin REAL NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending'
        )"""
    )
    conn.commit()
    conn.close()
