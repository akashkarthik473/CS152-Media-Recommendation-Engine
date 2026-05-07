# RecFinder — Media Recommendation Engine

By Akash Karthik & Robel Sebhat

CS 152 group project. RecFinder is a full-stack web app that gives users tailored
recommendations across movies, TV shows, books, and games. Users can either type a
free-form query (e.g. *"something dark and slow like Severance"*) or build a personal
list of media they already like and ask the recommendation engine to suggest more based
on that list. Recommendations are produced by Google's Gemini model on the backend.

---

## Stack

| Layer    | Tech                                                                    |
|----------|-------------------------------------------------------------------------|
| Frontend | React 19, TypeScript, Vite, React Router 7                              |
| Backend  | FastAPI, SQLAlchemy, Pydantic, Passlib (bcrypt), python-jose (JWT)      |
| Database | PostgreSQL 15                                                           |
| AI       | Google Gemini (`gemini-2.5-flash`) via `google-genai` SDK               |
| External | TMDB (movies/TV), RAWG (games), Google Books — used for media search    |
| Infra    | Docker Compose (frontend + backend + db)                                |

---

## Project layout

```
.
├── backend/              FastAPI server
│   ├── auth.py           JWT auth + signup/login/me endpoints
│   ├── media.py          User media list endpoints
│   ├── main.py           App entry, CORS, /health, /recommend (Gemini)
│   ├── database/
│   │   ├── db.py         SQLAlchemy engine, session, Base
│   │   └── models.py     User and Media ORM models
│   ├── Dockerfile
│   └── requirements.txt
├── RecFinder/            Vite + React frontend
│   └── src/
│       ├── api/          Backend wrappers (client, auth, recommendations, media)
│       ├── components/   AppLayout, Navbar, route guards, shared UI
│       ├── context/      AuthContext + AuthProvider
│       ├── hooks/        useAuth
│       ├── lib/          localStorage helpers (token + cached media list)
│       ├── pages/        HomePage, LoginPage, SignupPage, MediaListPage, NotFoundPage
│       ├── styles/       Global tokens + base styles
│       └── types/        Shared TypeScript types (User, Media, MediaType, AuthToken)
├── Dockerfile            Frontend image
├── docker-compose.yml    Brings up frontend + backend + postgres
└── .env.example          Template for required environment variables
```

---

## Environment variables

Copy `.env.example` to `.env` at the repo root before starting anything.

| Variable                | Required | Used by   | What it is                                             |
|-------------------------|----------|-----------|--------------------------------------------------------|
| `GEMINI_API_KEY`        | Yes      | Backend   | Google Gemini API key for `/recommend`                 |
| `VITE_TMDB_API_KEY`     | Yes      | Frontend  | TMDB v3 key — searches movies and TV shows on the list page |
| `VITE_RAWG_API_KEY`     | Yes      | Frontend  | RAWG key — searches games on the list page             |
| `VITE_GOOGLE_API_KEY`   | Yes      | Frontend  | Google Books key — searches books on the list page     |
| `VITE_API_URL`          | No       | Frontend  | Backend base URL, defaults to `http://127.0.0.1:8000`  |

The Postgres credentials and JWT signing key currently live in
`docker-compose.yml` and `backend/auth.py`. They are fine for local dev but should be
moved to environment variables before any real deployment.

---

## Running locally with Docker (recommended)

This is the path used during the demo.

```bash
# 1. Make sure Docker Desktop is running.
# 2. From the repo root:
cp .env.example .env
# fill in GEMINI_API_KEY, VITE_TMDB_API_KEY, VITE_RAWG_API_KEY, VITE_GOOGLE_API_KEY

docker compose up --build
```

Once the build settles you should see three services come up:

- `frontend` — http://localhost:5173
- `backend`  — http://localhost:8000 (interactive docs at http://localhost:8000/docs)
- `db`       — postgres on port 5432

The backend creates its tables automatically on startup via `Base.metadata.create_all`.

To stop:

```bash
docker compose down
```

To wipe the database too:

```bash
docker compose down -v
```

---

## Running locally without Docker

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Point SQLAlchemy at a local Postgres or change DATABASE_URL in database/db.py.
# Then:
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd RecFinder
npm install
npm run dev
```

Vite serves on http://localhost:5173 and is preconfigured to call the backend at
`http://127.0.0.1:8000`.

---

## API reference

All backend routes are mounted on `http://localhost:8000`. Routes marked **auth required**
expect a `Authorization: Bearer <token>` header where `<token>` was returned by `POST /token`.

### Health

| Method | Path      | Auth | Body | Description                          |
|--------|-----------|------|------|--------------------------------------|
| GET    | `/health` | —    | —    | Returns `{ "status": "ok" }`         |

### Auth (`backend/auth.py`)

| Method | Path      | Auth | Body                                 | Returns                        |
|--------|-----------|------|--------------------------------------|--------------------------------|
| POST   | `/signup` | —    | `{ username, email, password }`      | `UserPublic`                   |
| POST   | `/token`  | —    | form: `username`, `password`         | `{ access_token, token_type }` |
| GET    | `/me`     | Yes  | —                                    | `UserPublic`                   |

`POST /token` uses the OAuth2 password flow, so the body is form-encoded
(`application/x-www-form-urlencoded`), not JSON.

### Recommendations (`backend/main.py`)

| Method | Path         | Auth | Body                          | Returns                      |
|--------|--------------|------|-------------------------------|------------------------------|
| POST   | `/recommend` | Yes  | `{ query, media_type }`       | `{ recommendations: string }`|

`media_type` is one of `"any"`, `"movie"`, `"tv"`, `"music"`, `"book"`. The endpoint
forwards the query to Gemini and returns the model's text directly.

### Media list (`backend/media.py`)

| Method | Path                | Auth | Body                                              | Returns        |
|--------|---------------------|------|---------------------------------------------------|----------------|
| POST   | `/media`            | Yes  | `{ user_id, mediaType, title, subtitle, posterPath }` | `MediaPublic`  |
| DELETE | `/media/{media_id}` | Yes  | —                                                 | `{ ok: true }` |
| POST   | `/media_list`       | Yes  | `{ user_id }`                                     | `MediaPublic[]`|

Users can only read, write, or delete their own media items. `mediaType` is one of
`"movie"`, `"tv"`, `"book"`, `"game"`.

---

## Demo walkthrough

The grading demo follows this script. Each step lines up with the rubric's
*Runtime / input validation* expectations.

1. **Bring the stack up.** `docker compose up --build` from the repo root. Wait until
   the frontend logs `Local: http://localhost:5173/`.
2. **Sign up.** Open http://localhost:5173, click *Sign up*, register a new account.
   Empty fields and short passwords (under 8 characters) are blocked client-side; an
   already-taken username is rejected by the backend with a visible alert.
3. **Get redirected.** After sign-up the app logs the user in automatically and lands
   on the home page. A logged-in navbar replaces the public one.
4. **Free-form recommendation.** On the *Search* tab, pick a media type, type a
   prompt like *"shows like The Bear"*, and click **Recommend**. Gemini returns five
   suggestions in the results card.
5. **Build a media list.** Go to the *List* page from the navbar. Click the `+` tile in
   any category, search a title, click **Add**. The item appears as a poster card and
   is persisted to Postgres. Adding a duplicate shows an inline error.
6. **Recommendation from list.** Back on the home page, switch to the *List* tab,
   pick which list category to feed in (or *Any*), and click **Recommend**. Gemini
   recommends new media based on the items the user saved.
7. **Persistence.** Click an item card to delete it (round-trips through `/media/{id}`).
   Refresh the page — the remaining list survives because `media_list` is reloaded on
   login and cached in `localStorage`.
8. **Sign out.** Hit *Sign out* in the navbar. The token and cached list are wiped from
   `localStorage`, and protected routes bounce back to `/login`.

---

## Testing and validation

- **Auth:** rejects duplicate usernames (`POST /signup` → 400), invalid credentials
  (`POST /token` → 401), missing/expired/forged JWTs (`GET /me` → 401).
- **Authorization:** users cannot read, add, or delete other users' media — the
  `/media`, `/media/{id}`, and `/media_list` handlers all check `current_user.id`.
- **Frontend forms:** required fields, password `minLength=8`, empty-query guard on
  `/recommend`, duplicate-add guard on the media list.
- **Network errors:** any failed fetch is surfaced through `Alert` with the backend
  message when available.

---

## Authors

CS 152 group project — Akash Karthik, Robel Sebhat.
