# Contest Participation System

A REST API where users join contests, answer typed questions, get scored, land on a leaderboard, and win prizes. Access is gated by role (Guest, Normal, VIP, Admin). Built with plain Node.js, Express and TypeScript on a clean 3-layer architecture (controller to service to DAO), backed by MySQL 8 and Redis.

## Table of contents

- [Stack](#stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Authentication and roles](#authentication-and-roles)
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
- `POST /contests/:id/questions`, `PATCH /questions/:id`, `DELETE /questions/:id` (admin)
- `POST /questions/:id/options`, `PATCH /options/:id`, `DELETE /options/:id` (admin)

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
- Swagger UI at `/api-docs`
- Unit and integration tests with coverage

## Why plain Node over Strapi

The task suggested Strapi, but this is deliberately built on plain Node, Express and TypeScript. The domain (typed scoring, transactional submit, DB-configured rate limits, BullMQ award scheduling, role and window gating) benefits from full control over the request lifecycle and a clean, testable layered architecture rather than a CMS admin abstraction. MySQL 8 is used in place of Postgres for the SQL deliverable; the Sequelize dialect makes that a one-line swap.
