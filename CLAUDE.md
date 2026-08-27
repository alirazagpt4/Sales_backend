# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Node.js + Express 5 + Sequelize 6 (MySQL) REST API for a field-sales / distribution
management system ("FSPL Backend"). It manages sales staff and their reporting hierarchy,
daily field check-ins (`Startday`), customer visits with GPS verification, the customer and
product masters, sale orders, and a set of management reports/KPIs.

Full documentation lives in [`docs/`](./docs/README.md):
project flow, database design, schemas, and the endpoint reference.

## Commands

```bash
npm run dev          # start with nodemon (server.js)
npm start            # start with node
npm run migrate      # npx sequelize-cli --config ./config/config.cjs db:migrate
npm run migrate:undo # revert last migration
npm run seed:all     # run all seeders (cities, designations)
```

There is **no test suite** and **no linter** configured.

## Environment

Requires a `.env` (git-ignored) with:
`PORT, DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_DIALECT (mysql), JWT_SECRET`.
The DB must already exist and be reachable; the server calls `sequelize.authenticate()`
on boot and exits logging an error if it fails.

## Architecture & conventions

- **ES Modules** (`"type": "module"`). Use `import`/`export`. Migrations/seeders/config are
  `.cjs` (CommonJS) because `sequelize-cli` needs that.
- **Layering**: `routes/*.routes.js` (define paths + middleware) → `controllers/*.controller.js`
  (all business logic + Sequelize queries) → `models/*.model.js`. No service layer.
- **`models/associations.js` is the source of truth for all relations.** It is imported once
  in `server.js` for its side effects. When adding a model, register it and its associations
  there, and import models *from* `associations.js` in controllers that need joins (so aliases
  resolve) — e.g. `import { Customers, User, City } from '../models/associations.js'`.
- **Auth**: `Middlewares/authMiddleware.js` — `authenticateToken` (sets `req.user` from the
  Bearer JWT), `isAdmin`, `isSuperAdmin`. Roles: `user` < `admin` < `superadmin`.
  Destructive routes (PATCH/DELETE on users, customers, items) require `superadmin`.
- **File uploads**: `Middlewares/multerMiddleware.js` → disk storage in `uploads/`, images
  only, 5 MB cap. Served back at `/public/<filename>`.
- **Reporting hierarchy**: `User.reportTo` self-FK. Team scoping walks it recursively —
  `herarchy/herarchy.js#getFlatIds` (note the misspelled folder) and an in-memory recursion
  in `User.controller.js#getMyTeamList`.
- **Transactions**: used in `sale.order.controller.js` for the order + line-items write.
  Follow that pattern for any multi-table write.
- Comments throughout the codebase are in Roman-Urdu/English mix — this is normal, match the
  surrounding style; keep new comments minimal and in English.
- Commit messages in history are terse ("changes in FSPL Backend"); no PR workflow is in use.

## Schema management

Schema changes go through `sequelize-cli` migrations in `migrations/` (timestamped `.cjs`).
Update the corresponding `models/*.model.js` **and** the migration. Do not rely on
`sequelize.sync()` — it is deliberately disabled in `server.js`.

## Known quirks — do not "fix" casually, they are load-bearing

- Table name casing is mixed: `Users`, `Cities`, `Designations`, `Items`, `Startdays` (PascalCase)
  vs `customers`, `visits`, `sale_orders`, `sale_order_items` (`freezeTableName` lowercase).
- `visits.customer_id` / `sale_orders.customer_id` are declared `STRING` in models but the
  `visits` migration made the column `INT` with an FK. Joins work via loose typing.
- `sale_orders.status` enum differs between model and migration.
- `Startday` association in `associations.js` uses `user_id` but the column is `userId`;
  controllers query `Startday` by `userId` directly, so the association is effectively unused.
- Normal user login JWTs have **no expiry**; only admin login sets `1d`.
- `POST /api/users/register` has no auth middleware despite the README claiming admin-only.
- `routes/sales.js` is imported in `server.js` but never mounted.
- `GET /api/users/protected` is shadowed by `GET /api/users/:id` and is unreachable.
- `routes/report.routes.js` imports `isAdmin` but every report route is gated by
  `authenticateToken` only — any logged-in user can pull any salesperson's report by name.
  `GET /api/reports/test-route` has no auth at all.
- `report.controller.js` mixes date filtering: most reports use string-interpolated
  `Op.between` on `createdAt`, `generateDailyVisitReport` / `generateVisitVerificationReport`
  build UTC `Date` bounds, and `getVisitCountReport` filters on the `visits.date` column.
- `generateSalesPersonWiseDvrReport` deliberately fetches *all* of a user's `Startday` rows
  up to `toDate` (no lower bound) to carry a "last valid meter reading" baseline across
  leave / zero-reading days — do not add a `fromDate` floor to that query.

## When adding an endpoint

1. Add/extend a controller in `controllers/`.
2. Wire it in the matching `routes/*.routes.js` with the right auth middleware; watch route
   ordering (literal paths before `/:id`).
3. If it's a new resource, `app.use('/api/<x>', xRoutes)` in `server.js`.
4. Update the relevant file(s) under `docs/`.
