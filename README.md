# Safex

Safex is a peer-to-peer (P2P) cryptocurrency trading platform where users can
list offers to sell crypto and buy from each other, paying with local methods
such as M-Pesa, Airtel Money or bank transfer.

> **Note:** Safex is a portfolio and learning project. It tracks trades but
> does not hold funds or verify payments, so it must not be used to trade real
> money in its current form.

**Live demo:** https://safexapp.netlify.app
**API docs:** https://YOUR-SERVICE.onrender.com/docs

## Try it on your phone

![Scan to open Safex](frontend/public/qr.png)

## Features

- Register and log in (passwords hashed, JWT sessions that expire after 12 hours)
- Marketplace of live offers, filterable by BTC, ETH and USDT
- Post your own offers with a price, limits and payment method
- Buy flow with amount limits and an estimate of the coins you receive
- Trade lifecycle: pending, paid, completed or cancelled
- Dashboard showing your balances, open offers and trades
- Demo wallet with deposit and withdraw, and escrow that locks a seller's crypto while an offer is open
- Responsive layout with a mobile menu

## Tech stack

| Part     | Technology                                      | Hosted on |
|----------|-------------------------------------------------|-----------|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS  | Netlify   |
| Backend  | Python, FastAPI, Uvicorn, PyJWT                 | Render    |
| Database | SQLite locally, PostgreSQL in production        | Render    |

## Project structure
safex/
├── frontend/ React website
│ └── src/
│ ├── components/ Navbar, Hero, Stats, Features, Footer
│ ├── pages/ Home, Login, Register, Marketplace,
│ │ CreateOffer, Dashboard, NotFound
│ └── services/ Axios API helper
└── backend/ FastAPI server
└── app/
├── main.py App setup, CORS, auth routes
├── db.py Database connection (SQLite or Postgres)
├── security.py Password hashing and tokens
├── deps.py Current-user dependency
├── offers.py Offer endpoints
└── trades.py Trade endpoints

## Run it locally

You need Node.js 18+ and Python 3.10+.

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at http://localhost:8000 and its interactive docs are at
http://localhost:8000/docs. Without a `DATABASE_URL` it uses a local SQLite
file (`safex.db`).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The website runs at http://localhost:5173.

## Environment variables

| Variable       | Where    | Purpose                                              |
|----------------|----------|------------------------------------------------------|
| `DATABASE_URL` | backend  | PostgreSQL connection string (omit to use SQLite)    |
| `SECRET_KEY`   | backend  | Signs login tokens. Use a long random value          |
| `FRONTEND_URL` | backend  | Your website address, allowed by CORS                |
| `VITE_API_URL` | frontend | Backend address (defaults to http://localhost:8000)  |

## API overview

| Method | Endpoint                | Auth | What it does                         |
|--------|-------------------------|------|--------------------------------------|
| POST   | `/auth/register`        | No   | Create an account                    |
| POST   | `/auth/login`           | No   | Log in and receive a token           |
| GET    | `/auth/me`              | Yes  | Current user                         |
| GET    | `/offers`               | No   | List active offers (`?coin=USDT`)    |
| POST   | `/offers`               | Yes  | Create an offer                      |
| DELETE | `/offers/{id}`          | Yes  | Close your own offer                 |
| POST   | `/trades`               | Yes  | Start a trade on an offer            |
| GET    | `/trades/mine`          | Yes  | Trades where you are buyer or seller |
| POST   | `/trades/{id}/paid`     | Yes  | Buyer marks the trade as paid        |
| POST   | `/trades/{id}/release`  | Yes  | Seller releases the crypto           |
| POST   | `/trades/{id}/cancel`   | Yes  | Cancel a pending trade               |

## How a trade works

1. A seller posts an offer (coin, price, limits, payment method).
2. A buyer picks the offer and enters an amount within the limits.
3. The buyer pays the seller outside the app and presses **I have paid**.
4. The seller confirms the money arrived and presses **Release crypto**.
5. Either side can cancel while the trade is still pending.

## Deployment

- **Backend (Render):** root directory `backend`, build command
  `pip install -r requirements.txt`, start command
  `uvicorn app.main:app --host 0.0.0.0 --port $PORT`. Set `DATABASE_URL`,
  `SECRET_KEY` and `FRONTEND_URL`.
- **Frontend (Netlify):** base directory `frontend`, build command
  `npm run build`, publish directory `dist`. Set `VITE_API_URL` to the Render
  address. The file `frontend/public/_redirects` makes page refreshes work.

## Known limitations and roadmap

- Escrow, deposits and withdrawals are simulated: no real crypto or money is held or sent
- Payments are not verified automatically
- No dispute handling, chat between buyer and seller, or ratings yet
- Offers cannot yet be edited, and the dashboard has no "my offers" list
- No email verification or password reset
- Planned: escrow, in-trade chat, dispute flow, notifications

## License

Released under the [MIT License](LICENSE).

## Screenshots

![Home](screenshots/home.png)
![Marketplace](screenshots/marketplace.png)
![Dashboard](screenshots/dashboard.png)

## Run it locally

**Backend**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Uses a local SQLite file (`safex.db`) when `DATABASE_URL` is not set.

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The frontend talks to http://localhost:8000 unless `VITE_API_URL` is set.

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | backend | PostgreSQL connection string (production) |
| `SECRET_KEY` | backend | Signs login tokens. Use a long random value |
| `FRONTEND_URL` | backend | Allowed frontend origin for CORS |
| `VITE_API_URL` | frontend | Address of the backend API |

Never commit real secrets. Generate a key with:
```bash
python3 -c "import secrets; print(secrets.token_hex(32))"
```

## API overview

Full interactive docs are at `/docs` on the backend.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Offers | `GET /offers`, `GET /offers/mine`, `POST /offers`, `DELETE /offers/{id}` |
| Trades | `POST /trades`, `GET /trades/mine`, `POST /trades/{id}/paid`, `/release`, `/cancel` |
| Wallet | `GET /wallet`, `POST /wallet/deposit`, `POST /wallet/withdraw` |
| Portfolio | `GET /portfolio`, `GET /portfolio/rates`, `GET /portfolio/history`, `POST /portfolio/transfer`, `POST /portfolio/convert` |
| Account | `GET/POST/DELETE /account/payment-methods`, `GET/PUT /account/settings`, `POST /account/change-password`, `GET /account/logins` |
| Growth | `GET /growth/referral`, `POST /growth/referral/apply`, `GET/POST /growth/verification` |
| Health | `GET /health` |

## How the escrow works

1. A seller posts an offer. The coins move from their available balance to locked.
2. A buyer opens a trade. That amount is reserved on the offer.
3. The buyer pays the seller outside the app and marks the trade as paid.
4. The seller confirms and releases. The locked coins move to the buyer.
5. If the trade is cancelled, the coins return to the offer or the seller.

All balance changes use guarded database updates so a balance can never go negative.

## Limitations

- Everything is simulated: deposits, withdrawals, payments and statuses are timers, not real transactions.
- Prices are live when the price service responds, otherwise fixed estimates.
- Verification is a demo form and checks nothing.
- No dispute handling, trade expiry, two-factor authentication or email verification yet.
- The free backend sleeps after inactivity.

## Ideas for next steps

- Trade expiry for unpaid trades
- Two-factor authentication and email verification
- Dispute and reporting flow
- Chat between buyer and seller
- Automated tests

## License

MIT. See [LICENSE](LICENSE).
