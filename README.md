# CSIET Member Database

Member-focused web app that lets CSIET students manage their profiles while partner companies browse approved talent. The repo currently ships a Vite/React frontend plus placeholders for the backend, database, and DevOps tracks that the team will fill in as the build matures.

---

## Tooling Checklist

| Category | Required Tooling | Why it matters |
| --- | --- | --- |
| Core JS runtime | **Node.js 18+** (ships with `npm`) | Powers Vite, React, Tailwind builds, and shared root tooling. |
| Frontend | **Vite** + **React 19** + **React DOM 19** | Live dev server and UI stack in `frontend/front`. |
| Styling | **Tailwind CSS**, **PostCSS**, **Autoprefixer** | Utility-first styling and build-time processing defined both at repo root (shared) and inside the frontend workspace. |
| Linting | **ESLint 9** with React/Refresh plugins | Ensures consistent code standards via `npm run lint` in `frontend/front`. |
| Backend | **Express 4**, **Mongoose 8**, **jsonwebtoken**, **bcryptjs** | REST API (`backend/`) that authenticates users against MongoDB. |
| Database | **MongoDB Atlas** (or self-hosted MongoDB) | Stores member/company login data accessed via Mongoose. |
| DB smoke test | **Node.js + Mongoose script** | Run `node backend/scripts/check-db.js` to verify MongoDB connectivity with the same config as the backend. |
| Version control | **Git** | Clone/push workflow and collaboration. |
| Optional | IDE with JS + Python support (VS Code, WebStorm, etc.) | Helpful, but not mandated. |

---

## Quick Start

1. **Clone & enter the repo**
   ```sh
   git clone <repo-url>
   cd CSIET-Member-Database
   ```
2. **Install shared Node tooling (keeps Tailwind/PostCSS versions aligned)**
   ```sh
   npm install
   ```
3. **Install frontend dependencies**
   ```sh
   cd frontend/front
   npm install
   ```
4. **Install backend dependencies**
   ```sh
   cd ../../backend
   npm install
   ```
5. **Copy environment templates if you need to reset them (dev-ready `.env` files are already checked in)**
   ```sh
   cp backend/.env.example backend/.env   # optional reset
   cp frontend/front/.env.example frontend/front/.env
   ```
6. **Seed the database with sample members + default login**
   ```sh
   cd backend
   npm run seed
   ```
7. **Run the services**
   - Backend API: `npm run dev` from `backend` (listens on `http://localhost:4000`)
   - Frontend UI: `npm run dev` from `frontend/front` (proxy requests to backend)
8. **Lint the React codebase**
   ```sh
   cd frontend/front
   npm run lint
   ```

---

## Environment Configuration

### Backend (`backend/.env`)

```
PORT=4000
MONGO_URI=mongodb://localhost:27017/csiet
JWT_SECRET=local-dev-secret
DEFAULT_MEMBER_EMAIL=member@example.com
DEFAULT_MEMBER_PASSWORD=changeme123
DEFAULT_MEMBER_NAME=Demo Member
DEFAULT_ADMIN_EMAIL=admin@example.com
DEFAULT_ADMIN_PASSWORD=adminpass123
DEFAULT_ADMIN_NAME=Site Admin
CLIENT_ORIGIN=http://localhost:5173
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=apikey-or-username
SMTP_PASS=secret
SMTP_SECURE=false
SMTP_FROM=CSIET <no-reply@your-domain.com>
```

- Already included for local development; adjust values (especially `JWT_SECRET` + `MONGO_URI`) before deploying.
- The API now also checks `MONGODB_URI`, so managed Mongo providers that export that variable name will work without renaming.
- `npm run seed` inserts the default login plus sample members populated with majors, years, interests, and resume links.
- An admin user is seeded alongside members. Use `role: "admin"` when calling `/api/auth/login` (example below) to request that credential.
- `CLIENT_ORIGIN` may contain a comma-separated list of allowed frontends for CORS.
- SMTP settings are optional; when omitted, emails are logged to the server console for development. Set them in production to deliver verification and password reset emails.

Example admin login request:

```sh
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"adminpass123","role":"admin"}'
```

### Deploying on Vercel

- **Backend (serverless API)**: point a Vercel project at the `backend/` directory. Vercel automatically builds `backend/api/index.js` as a Node serverless function, so each request runs the existing Express app through `serverless-http`. Set `MONGO_URI`/`MONGODB_URI`, `JWT_SECRET`, and the default member/admin env vars inside the project’s Environment Variables tab, then run `npm run seed` locally against that URI to create accounts before first use.
- **Frontend (Vite)**: create a second Vercel project rooted at `frontend/front/`. Use `npm run build` as the build command and `dist` as the output directory. Configure `VITE_API_BASE_URL` to your backend project URL plus `/api` (for example, `https://csiet-api.vercel.app/api`).
- **Local parity**: `npm run dev` in `backend/` still spins up the Express server for local testing, while deployments reuse the same code path via the serverless handler, so behavior remains consistent across environments.

### Frontend (`frontend/front/.env`)

```
VITE_API_BASE_URL=http://localhost:4000
```

- The member login form posts to `${VITE_API_BASE_URL}/api/auth/login`.
- When deploying, point this value to the hosted backend URL.
- Login state now persists across refreshes via `localStorage` (`csiet.auth`). Logging out or an expired token clears it and sends members back to the login screen.
- When `VITE_API_BASE_URL` is omitted in production, the frontend automatically falls back to the current window origin (so `/api/*` requests stay on the same Vercel host). Set it explicitly if your API is deployed to a different hostname.

### Database health check script

- `backend/scripts/check-db.js` verifies that the Mongo URI in `backend/.env` is reachable using the same Mongoose version as the API. Example usage:
  ```sh
  cd backend
  node scripts/check-db.js
  ```

---

## Directory Guide

```
CSIET-Member-Database/
├── frontend/front/        # Vite + React app, Tailwind configs, ESLint setup
├── backend/               # Express + MongoDB API (auth routes, seeding scripts)
├── backend/scripts/       # Utility scripts (e.g., MongoDB connectivity check)
├── database/              # Placeholder for schema docs, seed data, migrations
├── devops/                # Placeholder for IaC, deployment scripts, CI/CD configs
├── node_modules/, package*.json  # Root-level shared tooling for Tailwind/PostCSS
```

---

## Common Commands

| Location | Command | Purpose |
| --- | --- | --- |
| repo root | `npm install` | Sync shared Tailwind/PostCSS dependencies. |
| backend | `npm install` | Install Express/Mongoose dependencies. |
| backend | `npm run dev` | Start the REST API with nodemon. |
| backend | `npm run seed` | Insert the default member credential. |
| backend | `npm run start` | Run the API without nodemon (production style). |
| backend | `npm test` | Run the backend Vitest suite (mocked Mongo). |
| `frontend/front` | `npm install` | Install React/Vite dependencies. |
| `frontend/front` | `npm run dev` | Start Vite dev server with HMR. |
| `frontend/front` | `npm run build` | Produce optimized production bundle. |
| `frontend/front` | `npm run preview` | Serve the built assets for local QA. |
| `frontend/front` | `npm run lint` | Apply ESLint rules (JS + React). |
| backend | `node scripts/check-db.js` | Smoke-test MongoDB connectivity using Mongoose + env config. |

---

## API Overview

### Authentication Routes

| Method | Route | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Returns a JWT + user payload for valid member/company credentials. | No |
| `POST` | `/api/auth/register` | Register a new member account. Returns JWT + user payload. | No |

### Member Routes

| Method | Route | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/members` | Create a new member account (alternative to `/api/auth/register`). | No |
| `GET` | `/api/members` | List all member profiles (name, major, year, interests, resume URL). | Yes |
| `GET` | `/api/members/:id` | Get a specific member's profile by ID. | Yes |
| `GET` | `/api/members/me` | Returns the logged-in member's profile. | Yes |
| `PUT` | `/api/members/me` | Update your own profile (name, major, year, interests, resume link). | Yes |
| `DELETE` | `/api/members/me` | Delete your own account. | Yes |
| `DELETE` | `/api/members/:id` | Delete a member by ID (admin only). | Yes (Admin) |

### Notes

- All authenticated routes require an `Authorization: Bearer <token>` header using the JWT from the login/register response.
- Admin-only routes require a user with `role: "admin"` in their JWT token.
- Use `npm run seed` to bootstrap both the default login (`member@example.com` / `changeme123`) and several sample members that immediately show up inside the dropdown directory UI.
- Valid year values: `Freshman`, `Sophomore`, `Junior`, `Senior`, `Graduate`.

---

## Roadmap & Next Actions

- Stand up the backend inside `backend/` (FastAPI, Express, or preferred framework) and document the runtime/language-specific tooling it needs.
- Capture database schema decisions under `database/` (ERDs, migrations, seed data) so contributors can bootstrap local data quickly.
- Populate `devops/` with infrastructure-as-code, CI/CD definitions, and deployment runbooks.
- Once backend and DevOps layers exist, extend this README with service-specific setup instructions (Docker, tests, etc.).

With the tools above installed, new contributors can boot the frontend, validate MongoDB access, and start filling in the remaining layers without guessing what to install. 
