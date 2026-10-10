# Mini MERN E-commerce Store

A beginner-friendly MERN shopping app with:
- React + Vite frontend
- Node.js + Express REST API
- MongoDB + Mongoose product storage
- Search, category filters, add-to-cart, quantity updates, remove item, cart total
- Seed route to add sample products

## Requirements
- Node.js (LTS)
- MongoDB running locally OR a MongoDB Atlas connection string

## 1. Configure the backend
Open a terminal in `server`:

```bash
npm install
```

Copy `.env.example` to `.env`, then set `MONGO_URI`.
For local MongoDB, the default URI is:
`mongodb://127.0.0.1:27017/mini_mern_store`

Start backend:
```bash
npm run dev
```
Backend runs at `http://localhost:5000`.

Add sample products by opening this URL once:
`http://localhost:5000/api/products/seed`
This is a demo seed endpoint; remove/disable it before deploying publicly.

## 2. Start the frontend
Open a second terminal in `client`:

```bash
npm install
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## API routes
- `GET /api/health` — API health check
- `GET /api/products` — list products (optional `?search=...&category=...`)
- `GET /api/products/:id` — get one product
- `POST /api/products` — create product (demo API; add validation/auth before production)
- `POST /api/products/seed` — insert demo products if database is empty

## Important
This is a learning project, not a production checkout system. It does not process real payments or place real orders. Before production, add authentication, server-side validation, admin authorization, secure checkout/payment integration, rate limiting, and deployment configuration.
