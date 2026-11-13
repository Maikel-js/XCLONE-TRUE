# AGENTS.md — XCLONE-TRUE

Twitter/X clone: Express + Prisma backend, Next.js frontend, shared Postgres.

## Commands

```bash
# Backend (runs HTTP API + WebSocket on ONE server, port 3000)
cd backend && npm run dev          # node --watch websocket/websocket.server.js

# Frontend (Next.js, port 3001 — NOT the default 3000)
cd frontend/frontend && npm run dev

# Database (Postgres 16 in Docker)
docker compose up -d               # from repo root

# Prisma (run from backend/)
npx prisma migrate dev
npx prisma generate

# Smoke checks (no test suite exists — backend `npm test` is a stub)
cd backend && node test-db.js      # verifies Prisma/DB connection
cd backend && node test-ws.js      # HTTP + WebSocket round-trip test
cd frontend/frontend && npm run lint
```

- There is no root package.json; each side is its own npm project.
- No tests exist. Use `test-db.js` / `test-ws.js` and `npm run lint` for verification.

## Structure & gotchas

- `backend/websocket/websocket.server.js` is the real entrypoint: it wraps `app.js` (Express) in an HTTP server and attaches `ws` to the same port. `app.js` alone is not runnable. `npm run dev` watches the websocket server, not app.js.
- Backend `.env` is loaded manually in `websocket.server.js` via `dotenv` with an explicit path — plain `require('dotenv').config()` from elsewhere won't pick it up.
- Backend is CommonJS (`require`), plain JavaScript — don't introduce ESM or TS there. Frontend is Next.js 16 + React 19 + TS.
- Route mounting in `app.js`: `/health`, `/users`, `/posts`, `/likes`, `/follows`, `/auth` (oauth lives under `/auth/oauth/:provider` and `/auth/oauth/:provider/callback`). `routes/poll.route.js` and `controllers/poll.controller.js` are empty placeholders; only `services/poll.service.js` has content.
- Auth: JWT Bearer (`Authorization: Bearer <token>`, `JWT_SECRET` in backend/.env); middleware sets `req.userId`. WebSocket auth is separate: JWT passed as a query param, verified in `websocket/wsAuth.js` before upgrade (401 on failure).
- `prisma.config.ts` uses `engine: "classic"` and `env("DATABASE_URL")` — schema + migrations live in `backend/prisma/`. Prisma client is a bare singleton in `backend/lib/prismaClient.js`.
- File uploads go to `backend/uploads/` (multer), served statically at `/uploads`.

## Ports / env

- Backend API + WS: 3000. Frontend: 3001. Postgres corre en Docker (`docker compose up -d`) publicado en el host en el **puerto 5433** (el 5432 del host lo usa un Postgres del sistema ajeno a este repo); `backend/.env` apunta `DATABASE_URL` a 5433 — mantener ese acuerdo.
- Frontend env: `NEXT_PUBLIC_API_BASE`, `NEXT_PUBLIC_WS_URL` (both `http(s)://localhost:3000` / `ws://localhost:3000`), set in `frontend/frontend/.env.local`; `NEXT_PUBLIC_GIPHY_API_KEY` also used.

## Frontend frontend/AGENTS.md

`frontend/frontend/AGENTS.md` (and `CLAUDE.md`, which just references it) contains a Next.js agent-rules block: this is a newer Next.js than your training data — read the bundled docs in `frontend/frontend/node_modules/next/dist/docs/` before writing frontend code. That block is auto-managed by `next dev`; don't strip it from diffs.
