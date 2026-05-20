# Deployment Guide

This app is two deployables that talk over HTTP:

- **Frontend** — Next.js (`frontend/`) → **Vercel**
- **Backend** — FastAPI + scikit-learn (`backend/`) → **Render** (Docker container)

The frontend calls the backend via the `NEXT_PUBLIC_API_URL` env var
(see [frontend/lib/api.ts](frontend/lib/api.ts)).

```
Browser ──> Vercel (Next.js)  ──HTTP──>  Render (FastAPI + models)
```

Why not the backend on Vercel? It needs scipy/pandas/sklearn (~187 MB) plus
~45 MB of pickled models and a long-running process — that does not fit Vercel's
serverless function limits. Render runs it as a normal container.

---

## Prerequisites (already set up in this repo)

- **Git LFS** tracks `ml/models/*.pkl` (see `.gitattributes`) so the models ship
  with the repo. Render and GitHub both pull LFS objects automatically.
  - First time on a new machine: `git lfs install` then `git lfs pull`.
- **`backend/Dockerfile`** builds from the repo root and bakes in `ml/models`.
- **`render.yaml`** is a Render Blueprint for the backend.
- **`backend/requirements.txt`** pins sklearn/numpy/scipy/pandas to the exact
  versions the models were pickled with — do not loosen these or `joblib.load`
  may fail.

---

## Part A — Backend on Render

1. Push this repo (with LFS objects) to GitHub:
   ```bash
   git lfs install
   git add -A
   git commit -m "Add deployment config (Vercel frontend + Render backend, Git LFS models)"
   git push
   ```
2. In Render: **New → Blueprint**, select this repo. Render reads `render.yaml`
   and creates the `crime-forecast-api` web service.
3. Deploy. The first build installs deps and bakes in the models (a few minutes).
4. Once live, copy the service URL, e.g. `https://crime-forecast-api.onrender.com`.
5. Verify: open `https://<your-url>/health` — expect
   `{"status": "...", "models_loaded": 6}`. Docs are at `/docs`.

> Free tier spins down when idle, so the first request after a pause takes
> ~30–60 s (cold start + model load). Upgrade the plan to avoid this.

## Part B — Frontend on Vercel

1. In Vercel: **Add New → Project**, import this repo.
2. **Set Root Directory to `frontend`** (this is a monorepo — required, or the
   build fails). Framework preset auto-detects as Next.js.
3. Add an environment variable (Production + Preview):
   - `NEXT_PUBLIC_API_URL` = your Render URL from Part A (no trailing slash).
   - This is inlined at build time, so it must be set **before** you deploy.
4. Deploy. Copy the resulting URL, e.g. `https://your-app.vercel.app`.

## Part C — Let the frontend talk to the backend (CORS)

The backend only allows origins listed in `ALLOWED_ORIGINS`
(see [backend/app/core/cors.py](backend/app/core/cors.py)).

1. In Render → your service → **Environment**, set:
   - `ALLOWED_ORIGINS` = `https://your-app.vercel.app`
   - (optional, for Vercel preview URLs) `ALLOWED_ORIGIN_REGEX` =
     `https://your-app-.*\.vercel\.app`
2. Save — Render redeploys. The dashboard should now load data with no CORS
   errors in the browser console.

---

## Local testing

Run the whole stack the way it deploys, via Docker:

```bash
docker compose up --build
# frontend: http://localhost:3000   backend: http://localhost:8000/docs
```

Or just the backend image (build context is the repo root):

```bash
docker build -f backend/Dockerfile -t crime-api .
docker run --rm -p 8000:8000 crime-api
```

---

## Optional optimizations

- **Shrink models / cold starts.** `random_forest_regressor.pkl` (~34 MB)
  dominates load time. Re-saving with `joblib.dump(model, path, compress=3)` or
  retraining with fewer/shallower trees cuts image size and cold-start latency.
  If you retrain, re-pin `backend/requirements.txt` to your training versions.
- **Keep the free instance warm** with an external uptime pinger hitting
  `/health`, or move to a paid plan.
