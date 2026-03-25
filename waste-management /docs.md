# Waste Management System — Docs

## Architecture

```
frontend/   React + Vite (port 5173)
backend/    Node.js + Express (port 3000)
database/   MySQL
```

## Roles

| Role     | Access                                      |
|----------|---------------------------------------------|
| `admin`  | Stats overview, user/route management       |
| `driver` | Assigned collections, status updates        |
| `user`   | Personal bin/collection status              |

## Auth Flow

1. `POST /api/auth/login` returns `{ token, user }`
2. Token is stored in `localStorage` and decoded client-side (no extra round-trip)
3. JWT payload must include `userId`, `name`, `email`, `role`, `exp`
4. Expired tokens are cleared automatically on page load

## API Endpoints

| Method | Path                    | Auth    | Description              |
|--------|-------------------------|---------|--------------------------|
| GET    | `/`                     | none    | Health check             |
| POST   | `/api/auth/login`       | none    | Login → token + user     |
| GET    | `/api/collections`      | driver  | List driver's collections|
| PATCH  | `/api/collections/:id`  | driver  | Update collection status |

## Demo Accounts (password: `password123`)

- `admin@test.com` → Admin
- `driver@test.com` → Driver
- `user@test.com` → Resident

## Dev Setup

```bash
# Backend
cd backend && npm install && cp .env.example .env
# Fill in DB credentials, then:
mysql -u root -p < database.sql
npm start          # runs on :3000

# Frontend
cd frontend && npm install
npm run dev        # runs on :5173, proxies /api → :3000
```
