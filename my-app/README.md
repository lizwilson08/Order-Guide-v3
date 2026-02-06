# Order Guide

Restaurant ingredient price comparison across vendors, with unit conversion, shopping lists, and purchase orders.

## Run the app

### 1. Backend (API + SQLite)

```bash
cd server
npm install
npm run db:init   # create schema + seed data (vendors, ingredients, products)
npm run dev       # start API on http://localhost:3001
```

### 2. Frontend

```bash
cd my-app
npm install
npm run dev       # start Vite dev server (proxies /api to backend)
```

Open http://localhost:5173. Use **Order Guide** for ingredient comparison, **Shopping lists**, and **Purchase orders**. Open **Design System** to view core UI components.

## Stack

- **Frontend**: Vite, React 19, TypeScript, React Router, CSS Modules + design tokens.
- **Backend**: Node, Express, SQLite (better-sqlite3). Optional Postgres via env later.
