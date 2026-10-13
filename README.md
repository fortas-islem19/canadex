# Canadex

**Canada + Index.** Website and appointment booking system for Canadex, a Canadian visa consulting
office in Algeria (study permits, work permits, permanent residence, visitor visas, family sponsorship).

- Landing page in **Arabic (RTL), French and English**, with an animated boarding-pass hero, a services
  index, a 3-question "pathfinder", and an A–Z glossary of Canadian immigration terms.
- **Booking wizard**: service → calendar and time slots → details → review, with a live "consultation
  pass" preview, a reference number, an `.ics` calendar file and a WhatsApp hand-off.
- **API** with real availability (office hours, lunch break, Algerian weekend and public holidays,
  same-day notice, capacity per slot) and protection against double booking.
- **Back-office** at `/admin` to see, search, confirm or cancel appointments and export them to CSV.

## Project structure

npm workspaces monorepo — each part can be deployed and scaled on its own.

```
apps/
  web/        React 19 + Vite + TypeScript — website, booking wizard, /admin back-office
  api/        Node + Express 5 + SQLite — availability, bookings, admin endpoints
packages/
  shared/     Domain logic used by both: service catalog, office schedule, slot engine, zod schemas
```

Inside `apps/web/src`, code is organised by feature (`features/booking`, `features/glossary`,
`features/pathfinder`, `features/landing`, `features/admin`); shared UI lives in `components/`.
Inside `apps/api/src`, the HTTP layer (`bookings/routes.ts`) calls a service (`bookings/service.ts`)
that talks to a storage port (`bookings/repository.ts`), so the database can be swapped without
touching business rules.

## Getting started

Requires Node.js 22.12+ (see `.nvmrc`).

```bash
npm install
cp apps/api/.env.example apps/api/.env   # then set ADMIN_TOKEN to enable /admin
npm run dev                              # API on :4000, website on http://localhost:5173
```

| Command             | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run dev`       | API (watch mode) + website with hot reload                    |
| `npm test`          | Unit and integration tests for every workspace                |
| `npm run typecheck` | TypeScript checks                                             |
| `npm run lint`      | ESLint                                                        |
| `npm run build`     | Production build of the website and the API                   |
| `npm start`         | Runs the built API, which also serves the website on one port |

## Things to customise before launch

| What                                                                                     | Where                                       |
| ---------------------------------------------------------------------------------------- | ------------------------------------------- |
| Address, phone, WhatsApp, email (placeholders for now)                                   | `apps/web/src/config/site.ts`               |
| Opening days and hours, lunch break, consultation length, consultants per slot, holidays | `packages/shared/src/schedule.ts`           |
| All texts, in each language                                                              | `apps/web/src/i18n/locales/{ar,fr,en}.json` |
| Logo files                                                                               | `apps/web/public/brand/`                    |

Islamic holidays move every year: add their dates to `closedDates` in `schedule.ts`.
A test (`locales.test.ts`) fails if a translation is missing or a `{{placeholder}}` is dropped.

## API

| Method & path                          | Purpose                                                                |
| -------------------------------------- | ---------------------------------------------------------------------- |
| `GET /api/health`                      | Health check                                                           |
| `GET /api/availability`                | Open days and free slots for the booking window                        |
| `POST /api/bookings`                   | Create a booking → `201 { booking }`, `409` if the slot is gone        |
| `GET /api/admin/bookings`              | List (`?status=&from=&to=&q=`) — `Authorization: Bearer <ADMIN_TOKEN>` |
| `PATCH /api/admin/bookings/:reference` | Change status: `new`, `confirmed`, `completed`, `cancelled`, `no_show` |

Validation errors come back as `{ "error": "validation", "fields": { "phone": "phone" } }`; the codes are
shared with the website, which shows them in the visitor's language. Booking requests are rate-limited
per IP and have a honeypot field against bots.

If the website cannot reach the API (for example when it is hosted as static files only), the booking
wizard keeps working: it computes the agenda locally and sends the request over WhatsApp instead.

## Configuration (`apps/api/.env`)

| Variable             | Default           | Notes                                                             |
| -------------------- | ----------------- | ----------------------------------------------------------------- |
| `PORT`               | `4000`            |                                                                   |
| `DATABASE_PATH`      | `data/canadex.db` | SQLite file, relative to `apps/api` (`/tmp/canadex.db` on Vercel) |
| `ADMIN_TOKEN`        | _(empty)_         | 16+ characters; empty disables `/admin`                           |
| `CORS_ORIGIN`        | _(empty)_         | Comma-separated origins, only if the site is on another domain    |
| `TRUST_PROXY`        | `0`               | Number of reverse proxies (e.g. `1` behind Nginx; `1` on Vercel)  |
| `NOTIFY_WEBHOOK_URL` | _(empty)_         | Receives every new booking as JSON (Slack, Make, Zapier, n8n…)    |

The website reads `VITE_API_URL` at build time when the API lives on a different domain.

## Deployment

Simplest: one Node process serves both the API and the built website.

```bash
npm ci && npm run build
ADMIN_TOKEN=… NODE_ENV=production npm start   # behind Nginx/Caddy for HTTPS, with TRUST_PROXY=1
```

Keep `apps/api/data/` on persistent storage and back it up — it contains clients' personal data and is
git-ignored on purpose.

### Vercel

`vercel.json` deploys the repository as one Vercel project with two services on one domain:

| Service | Folder     | Public path     | What it is                                                 |
| ------- | ---------- | --------------- | ---------------------------------------------------------- |
| `api`   | `apps/api` | `/api/*`        | Express app, run as a function (entrypoint `src/index.ts`) |
| `web`   | `apps/web` | everything else | Static Vite build; `/admin` is served `index.html`         |

The browser calls the API on the same origin (`/api/...`), so no service binding or `VITE_API_URL` is
needed. Set `ADMIN_TOKEN` (and optionally `NOTIFY_WEBHOOK_URL`) in the Vercel project's environment
variables, then test locally with `vercel dev` after `vercel link`.

**Storage warning:** Vercel functions can only write to `/tmp`, which is per instance and wiped on cold
starts, so SQLite there does not keep bookings. Use a hosted database (implement `BookingRepository`)
before taking real appointments on Vercel.

`src/index.ts` is the serverless entrypoint (default export); `src/main.ts` is the long-running server
used by `npm run dev` and `npm start`.

## Growing the system

- **Database** — implement `BookingRepository` for PostgreSQL (the contract, including the atomic
  "insert only if the slot still has room", is documented in `apps/api/src/bookings/repository.ts`).
- **Staff accounts** — replace the single bearer token in `apps/api/src/http/adminAuth.ts` with
  per-user logins when the team grows.
- **Notifications** — add a `BookingNotifier` (email, SMS, WhatsApp Business API) next to the webhook one.
- **Content** — the glossary and services live in the locale files, so a headless CMS can replace them later.
- **More languages** — add a locale file and its code to `LANGUAGES` in `packages/shared/src/catalog.ts`.

## Legal note

The site states that Canadex is an independent private office, not affiliated with the Government of
Canada or IRCC, and never promises a visa. Keep it that way: under Canadian law only authorised
representatives (licensed RCICs, lawyers, Québec notaries) may be paid to represent or advise people
on Canadian immigration applications.
