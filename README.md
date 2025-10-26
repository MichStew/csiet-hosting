# CSIET Member Database

| Purpose | Tool | Notes |
| --- | --- | --- |
| JavaScript tooling | **Node.js 18+** (bundled `npm`) | Needed for Vite dev server, React build, linting, and Tailwind tooling in both the repo root and `frontend/front`. |
| Frontend bundler | **Vite** (installed via npm scripts) | Available through `npm run dev/build/preview` once dependencies are installed. |
| Package linting | **ESLint** | Runs with `npm run lint` at `frontend/front`. |
| Styling | **Tailwind CSS** + **PostCSS** + **Autoprefixer** | Configured in root `package.json` (future shared styles) and `frontend/front`. |
| Python runtime | **Python 3.10+** with `pip` | Required for `database.py`, which demonstrates MongoDB connectivity using `pymongo`. |
| Database | **MongoDB Atlas** (or local MongoDB with URI) | Supply a valid `MONGO_URI`/`.env` entry for any script or backend component that talks to the database. |
| Version control | **Git** | Used for cloning and managing contribution workflow. |
| Optional IDE | VS Code / JetBrains / etc. | Any editor with JavaScript + Python support works; not enforced. |
=======
 There are a few goals that need to be met with this project
 // this should make a conflict 
>>>>>>> main

---

## Repository Layout

```
CSIET-Member-Database/
├── frontend/front/      # React + Vite source, Tailwind styling, linting configs
├── backend/             # Placeholder for future API implementation
├── database.py          # Sample MongoDB connection script (Python + pymongo)
├── database/            # Placeholder for schema/migration assets
├── devops/              # Placeholder for deployment/infrastructure automation
├── node_modules/, package*.json  # Root-level Tailwind tooling (shared styles)
```

---

## Frontend Setup & Commands

1. **Clone the project**
   ```sh
   git clone <repo-url>
   cd CSIET-Member-Database
   ```
2. **Install shared tooling (optional but keeps Tailwind versions aligned)**
   ```sh
   npm install
   ```
3. **Install frontend dependencies**
   ```sh
   cd frontend/front
   npm install
   ```
4. **Run the Vite dev server**
   ```sh
   npm run dev
   ```
   - Default URL: `http://localhost:5173`
   - Use `npm run build` for production output and `npm run preview` to test the built assets.
5. **Lint the React codebase**
   ```sh
   npm run lint
   ```

---

## Database & Backend Notes

The backend and database layers are currently placeholders. To experiment with MongoDB connectivity:

```sh
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install pymongo
export MONGO_URI="mongodb+srv://<user>:<pass>@cluster.mongodb.net/csiet"
python database.py
```

- Replace the placeholder URI in `database.py` with a secure connection string (ideally via environment variables).
- When the backend service is implemented under `backend/`, it will likely depend on the same MongoDB connection and Python or Node tooling described above.

---

## Next Steps for Contributors

- Flesh out `backend/` with chosen framework (FastAPI, Express, etc.) and document its runtime/tooling requirements.
- Define database schemas/migrations inside `database/`.
- Expand `devops/` with infrastructure-as-code or deployment scripts (Docker, CI/CD).

With the tools listed above installed, you can run every component currently present in the repo and are ready to iterate on the remaining layers. Let the maintainers know if additional stack details would help! 
