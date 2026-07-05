# Contest Participation System

A REST API where users join contests, answer typed questions, get scored, land on a leaderboard, and win prizes. Access is gated by role (Guest, Normal, VIP, Admin). Built with plain Node.js, Express and TypeScript on a clean 3-layer architecture (controller to service to DAO), backed by MySQL 8 and Redis.

## Table of contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Authentication and roles](#authentication-and-roles)
- [Frontend](#frontend)
- [Admin panel](#admin-panel)
- [API reference](#api-reference)
- [Rate limiting](#rate-limiting)
- [Caching and background jobs](#caching-and-background-jobs)
- [Testing](#testing)
- [Deliverables](#deliverables)
- [Why plain Node over Strapi](#why-plain-node-over-strapi)

## Stack

- Node.js 20 + Express + TypeScript (no Nest, no Strapi)
- Sequelize ORM + MySQL 8 (real migrations and seeders)
- Redis for cache-aside, rate limiting, and BullMQ background jobs
- JWT (jsonwebtoken) + bcryptjs, express-validator, Winston
- Swagger UI at `/api-docs`, Jest + supertest for unit and integration tests

## Architecture

Feature-first, 3-layer, no layer skipping:

```
controller (RouterClass) -> service (ServiceCRUD) -> dao (BaseDAO) -> Sequelize model
```

Each feature owns its `controllers/ services/ daos/ models/ dtos/ requests/ responses/ types/ enums/`. Shared spine lives in `src/common/`. Controllers stay thin (no business logic), services never touch req/res, DAOs hold every Sequelize query and return DTOs. Responses use a uniform envelope `{ result, errors }`, and every error is an `ApiError` carrying a granular `subCode`.

## Getting started

```bash
# 1. start MySQL 8 and Redis
docker compose up -d

# 2. install dependencies
npm install

# 3. copy env and adjust as needed
cp .env.example .env

# 4. run migrations and seed fake data (admin + sample contests, questions, prizes)
npm run db:migrate
npm run db:seed

# 5. run the API (dev, hot reload)
npm run dev
```

The API is served at `http://localhost:3000/api/v1`. Interactive docs at `http://localhost:3000/api-docs`. Health check at `/api/v1/health`.

### Frontend (optional UI)

A vanilla JS SPA lives in `frontend/` and proxies API calls to port 3000.

```bash
# with the API already running on :3000
npm run dev:frontend
```

Open `http://localhost:8080/contests`. Admin panel at `/admin` (login as seeded admin).

### Seeded demo accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@contest.local` | `change_me_admin` (or your `ADMIN_PASSWORD`) | Admin |
| `vip@contest.local` | `password123` | VIP |
| `normal@contest.local` | `password123` | Normal |

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | development | Runtime environment (dev-only stack traces) |
| `PORT` | 3000 | HTTP port |
| `API_PREFIX` | /api/v1 | Versioned route prefix |
| `DB_HOST` / `DB_PORT` | localhost / 3306 | MySQL connection |
| `DB_NAME` / `DB_USER` / `DB_PASSWORD` | contest_system / contest / change_me | MySQL credentials |
| `REDIS_HOST` / `REDIS_PORT` | localhost / 6379 | Redis connection |
| `JWT_SECRET` / `JWT_EXPIRES_IN` | (set me) / 1d | JWT signing |
| `BCRYPT_SALT_ROUNDS` | 10 | Password hashing cost |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | admin@contest.local / change_me_admin | Seeded admin account |
| `CACHE_TTL_SECONDS` | 60 | Cache-aside TTL |
| `RATE_LIMIT_STORE` | redis | `redis` or `memory` |

Only `.env.example` is committed. Never commit real secrets; seeders contain fake data only.

## Authentication and roles

Sign up returns a NORMAL user and a JWT. An admin (seeded) can grant VIP. Guests have no token and can only read public data.

| Action | Guest | Normal | VIP | Admin |
| --- | --- | --- | --- | --- |
| View contests, details, leaderboard | yes | yes | yes | yes |
| Join / answer / submit a NORMAL contest | no | yes | yes | yes |
| Join / answer / submit a VIP contest | no | no | yes | yes |
| See own history and prizes | no | yes | yes | yes |
| Manage contests, questions, prizes, policies | no | no | no | yes |

## Frontend

The frontend is a vanilla JS single-page app served by a lightweight Node.js static server that runs on port **8080** and proxies all `/api/` requests to the backend automatically — no CORS configuration needed.

### Running the frontend

```bash
# from the project root (API must already be running on :3000)
npm run dev:frontend

# or from inside the frontend/ folder
cd frontend && npm run dev
```

Open **`http://localhost:8080`**.

### Pages

| URL | Page | Who can access |
| --- | --- | --- |
| `/contests` | Browse all contests | Everyone |
| `/login` | Sign in | Everyone |
| `/signup` | Create account | Everyone |
| `/contests/:id` | Contest detail & leaderboard | Everyone |
| `/contests/:id/quiz` | Answer questions | Logged-in users |
| `/dashboard` | My contests & prizes | Logged-in users |
| `/admin` | Admin panel | Admin only |
| `/admin/contests/:id` | Manage a specific contest | Admin only |

The navbar shows the **Admin** link only when logged in as admin. The **Dashboard** link appears for any authenticated user.

## Admin panel

### Logging in as admin

1. Open `http://localhost:8080/login`
2. Enter `admin@contest.local` as the email
3. Enter `change_me_admin` as the password (or whatever `ADMIN_PASSWORD` is set to in `.env`)
4. Click **Sign In**

After a successful login the **Admin** link appears in the navbar. Click it to go to `http://localhost:8080/admin`.

### Admin panel overview

The page has two main sections:

**Manage Contests** — a table listing every contest with its status, access level, and start/end dates. Each row has a **Manage** button that opens the individual contest page. A **+ Create Contest** button at the top opens a modal form with these fields:

| Field | Description |
| --- | --- |
| Name | Contest title (required) |
| Description | Optional description |
| Access Level | `Normal` (all logged-in users) or `VIP` (VIP + admin only) |
| Start Time | When the contest opens |
| End Time | When the contest closes |

**User Management** — a table of all registered users showing name, email, current role, and join date. The **Action** column has a role dropdown per user. Changing the dropdown value saves the new role immediately. Available roles: `Normal`, `VIP`, `Admin`.

### Manage Contest page (`/admin/contests/:id`)

Reached by clicking **Manage** on any contest row. From here:

**Questions**
- Click **+ Add Question** → fill in question text, type (`Single Select`, `Multi Select`, `True / False`), points, and at least two answer options with the **Correct** checkbox on the right answer(s) → click **Add Question**
- Edit or delete existing questions inline

**Prizes**
- Click **+ Create Prize** → fill in title, rank (1 = first place), optional description → click **Create**
- Delete an existing prize with its delete button

## API reference

Base path `/api/v1`.

Auth and users
- `POST /auth/signup` create a NORMAL account, returns JWT
- `POST /auth/login` returns JWT (rate limited)
- `GET /auth/me` current profile
- `GET /admin/users` list users (admin, paginated + search)
- `PATCH /admin/users/:id/role` grant a role (admin)

Contests, questions, options (admin manages, public reads)
- `GET /contests` list (paginated, filter by status and access level)
- `GET /contests/:id` details
- `POST /contests`, `PUT /contests/:id`, `DELETE /contests/:id` (admin)
- `POST /contests/:id/questions`, `PUT /questions/:id`, `DELETE /questions/:id` (admin)
- `POST /questions/:id/options`, `PUT /options/:id`, `DELETE /options/:id` (admin)

Participation
- `POST /contests/:id/join` join (role + window gated, rate limited)
- `GET /contests/:id/questions` questions for a joined user (never leaks `is_correct`)
- `POST /contests/:id/answers` save or update draft answers
- `POST /contests/:id/submit` score and submit (transactional, rate limited)
- `GET /participations/:id` view own participation

Leaderboard, prizes, history
- `GET /contests/:id/leaderboard` ranked, paginated, cached
- `GET /contests/:id/prizes` list prizes; `POST /contests/:id/prizes`, `DELETE /prizes/:id` (admin)
- `GET /me/contests` my participations (optional `?status=IN_PROGRESS`)
- `GET /me/prizes` prizes I have won

Rate limit policies (admin)
- `GET /admin/rate-limit-policies`, `PATCH /admin/rate-limit-policies/:name`

A Postman collection with guest, normal, VIP and admin flows lives in `postman/`.

## Rate limiting

Per-IP and per-user limits backed by Redis (`rate-limiter-flexible`) behind a `RateLimitStore` interface, with a memory implementation for tests. Policies (`global`, `auth-login`, `contest-join`, `contest-submit`) are stored in the `rate_limit_policies` table, seeded with defaults, and loaded into the runtime limiter at boot. They are tunable through the admin endpoints without a redeploy.

## Caching and background jobs

- Cache-aside via `CacheService`: contest list/detail and leaderboard reads are cached with a short TTL and busted on write.
- BullMQ `prize-award` queue: creating a prize schedules a delayed job for the contest `end_time`. The worker awards the top submitted participants (score desc, earliest submit wins ties) in a transaction and is idempotent.

## Testing

Ensure Docker services are running first (`docker compose up -d`).

```bash
npm test          # unit + integration (Jest + supertest, against Docker MySQL)
npm run test:cov  # with coverage
npm run lint      # eslint
npm run typecheck # tsc --noEmit
```

Integration tests run against a disposable `<db>_test` MySQL database.

## Deliverables

- Source with conventional commits, migrations and fake-data seeders
- `db/schema.sql` MySQL schema dump
- `postman/collection.json` and `postman/environment.json`
- Swagger UI at `/api-docs` (full OpenAPI 3 schemas with request/response bodies)
- Vanilla JS frontend in `frontend/` (contests, quiz, admin management)
- Unit and integration tests with coverage

## Why plain Node over Strapi

The task suggested Strapi, but this is deliberately built on plain Node, Express and TypeScript. The domain (typed scoring, transactional submit, DB-configured rate limits, BullMQ award scheduling, role and window gating) benefits from full control over the request lifecycle and a clean, testable layered architecture rather than a CMS admin abstraction. MySQL 8 is used in place of Postgres for the SQL deliverable; the Sequelize dialect makes that a one-line swap.
