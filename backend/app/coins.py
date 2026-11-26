import json
import time
import urllib.request

# Coins Safex supports. KES is the fiat wallet and is handled separately.
COINS = ["USDT", "BTC", "ETH", "USDC", "SOL", "BNB", "XRP", "LTC"]

GECKO_IDS = {
    "BTC": "bitcoin", "ETH": "ethereum", "USDT": "tether", "USDC": "usd-coin",
    "SOL": "solana", "BNB": "binancecoin", "XRP": "ripple", "LTC": "litecoin",
}

# Used when the live price service cannot be reached.
FALLBACK_USD = {
    "BTC": 65000.0, "ETH": 3000.0, "USDT": 1.0, "USDC": 1.0,
    "SOL": 150.0, "BNB": 600.0, "XRP": 0.6, "LTC": 80.0,
}
FALLBACK_KES_PER_USD = 129.0

_cache = {"ts": 0.0, "usd": None, "kes": None, "live": False}


def _refresh():
    ids = ",".join(GECKO_IDS.values())
    url = ("https://api.coingecko.com/api/v3/simple/price?ids=" + ids +
           "&vs_currencies=usd,kes")
    req = urllib.request.Request(url, headers={"User-Agent": "safex-demo"})
    with urllib.request.urlopen(req, timeout=4) as r:
        data = json.loads(r.read().decode())
    usd = {}
    for sym, cid in GECKO_IDS.items():
        usd[sym] = float(data[cid]["usd"])
    kes = float(data["tether"]["kes"]) / float(data["tether"]["usd"])
    return usd, kes


def _load():
    now = time.time()
    if _cache["usd"] is not None and now - _cache["ts"] < 120:
        return
    try:
        usd, kes = _refresh()
        _cache.update(ts=now, usd=usd, kes=kes, live=True)
    except Exception:
        if _cache["usd"] is None:
            _cache.update(ts=now - 90, usd=dict(FALLBACK_USD), kes=FALLBACK_KES_PER_USD, live=False)
        else:
            _cache["ts"] = now - 90  # keep old prices, retry in 30s


def usd_rates():
    _load()
    out = dict(_cache["usd"])
    out["KES"] = 1.0 / _cache["kes"]
    return out


def kes_per_usd():
    _load()
    return _cache["kes"]


def is_live():
    _load()
    return _cache["live"]
