# CSIET Member Database

Member-focused web app that lets CSIET students manage their profiles while partner companies browse approved talent. The repo currently ships a Vite/React frontend plus placeholders for the backend, database, and DevOps tracks that the team will fill in as the build matures.

---

## Tooling Checklist

| Category | Required Tooling | Why it matters |
| --- | --- | --- |
| Core JS runtime | **Node.js 18+** (ships with `npm`) | Powers Vite, React, Tailwind builds, and shared root tooling. |
| Bundler / Dev server | **Vite** (`npm run dev`, `npm run build`, `npm run preview`) | Hot-module reload during development and production bundling. |
| UI framework | **React 19** + **React DOM 19** | Main frontend view layer located in `frontend/front`. |
| Styling | **Tailwind CSS**, **PostCSS**, **Autoprefixer** | Utility-first styling and build-time processing defined both at repo root (shared) and inside the frontend workspace. |
| Linting | **ESLint 9** with React/Refresh plugins | Ensures consistent code standards via `npm run lint` in `frontend/front`. |
| Python runtime | **Python 3.10+** with `pip` | Needed to run `database.py` and any future backend scripts that integrate with MongoDB. |
| Database | **MongoDB Atlas** (or self-hosted MongoDB) + `pymongo` | Current prototype uses an Atlas URI; production backend will share the same requirement. |
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
4. **Run the app**
   ```sh
   npm run dev
   ```
   - Default preview: `http://localhost:5173`
   - `npm run build` outputs production assets under `frontend/front/dist`
   - `npm run preview` serves the production bundle locally
5. **Lint the React codebase**
   ```sh
   npm run lint
   ```

---

## Environment Configuration

- Create a `.env` file (or export variables) for secrets that will eventually be shared by the backend and tooling:
  ```ini
  MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/csiet
  ```
- `database.py` expects `pymongo` to be installed and can reference the same `MONGO_URI`. Recommended workflow:
  ```sh
  python -m venv .venv
  source .venv/bin/activate  # Windows: .venv\Scripts\activate
  pip install pymongo
  python database.py
  ```
- When the backend service lands in `backend/`, follow the same pattern (dotenv support or secrets manager) so the URI never lives in source control.

---

## Directory Guide

```
CSIET-Member-Database/
├── frontend/front/        # Vite + React app, Tailwind configs, ESLint setup
├── backend/               # Reserved for the API/service layer (currently placeholder)
├── database.py            # MongoDB connection smoke test using pymongo
├── database/              # Placeholder for schema docs, seed data, migrations
├── devops/                # Placeholder for IaC, deployment scripts, CI/CD configs
├── node_modules/, package*.json  # Root-level shared tooling for Tailwind/PostCSS
```

---

## Common Commands

| Location | Command | Purpose |
| --- | --- | --- |
| repo root | `npm install` | Sync shared Tailwind/PostCSS dependencies. |
| `frontend/front` | `npm install` | Install React/Vite dependencies. |
| `frontend/front` | `npm run dev` | Start Vite dev server with HMR. |
| `frontend/front` | `npm run build` | Produce optimized production bundle. |
| `frontend/front` | `npm run preview` | Serve the built assets for local QA. |
| `frontend/front` | `npm run lint` | Apply ESLint rules (JS + React). |
| repo root | `python database.py` | Verify MongoDB connectivity (requires `pymongo` + configured URI). |

---

## Roadmap & Next Actions

- Stand up the backend inside `backend/` (FastAPI, Express, or preferred framework) and document the runtime/language-specific tooling it needs.
- Capture database schema decisions under `database/` (ERDs, migrations, seed data) so contributors can bootstrap local data quickly.
- Populate `devops/` with infrastructure-as-code, CI/CD definitions, and deployment runbooks.
- Once backend and DevOps layers exist, extend this README with service-specific setup instructions (Docker, tests, etc.).

With the tools above installed, new contributors can boot the frontend, validate MongoDB access, and start filling in the remaining layers without guessing what to install. 
