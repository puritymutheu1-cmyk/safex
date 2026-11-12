import os
import hmac
import hashlib
import secrets
import datetime
import jwt

SECRET = os.getenv("SECRET_KEY", "change-me-in-production")


def _hash(password, salt):
    return hashlib.pbkdf2_hmac(
        "sha256", password.encode(), salt.encode(), 200000
    ).hex()


def hash_password(password):
    salt = secrets.token_hex(16)
    return salt + "$" + _hash(password, salt)


def verify_password(password, stored):
    salt, digest = stored.split("$")
    return hmac.compare_digest(_hash(password, salt), digest)


def create_token(user_id):
    exp = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=12)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET, algorithm="HS256")
