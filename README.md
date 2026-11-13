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
- Dashboard showing your active and completed trades
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

- No real escrow: Safex does not hold or move any crypto or money
- Payments are not verified automatically
- No dispute handling, chat between buyer and seller, or ratings yet
- Offers cannot yet be edited, and the dashboard has no "my offers" list
- No email verification or password reset
- Planned: escrow, in-trade chat, dispute flow, notifications

## License

Released under the [MIT License](LICENSE).
