# Project Flow

## 1. Runtime bootstrap (`server.js`)

1. Load env vars via `dotenv`.
2. Create the Express app, enable `cors()`, `express.json()`, `morgan('dev')`.
3. Serve static assets:
   - `./public` at `/`
   - `./uploads` at `/public` (so an uploaded selfie saved as `uploads/image-123.jpg`
     is served at `GET /public/image-123.jpg`).
4. Import `./models/associations.js` — this file is the single place where **all**
   Sequelize models are wired together with `hasMany` / `belongsTo`. Importing it has
   the side effect of registering every model + association.
5. Mount route modules (see table below).
6. `sequelize.authenticate()` — verify the DB connection, then `app.listen(PORT)`.
   `sequelize.sync()` is intentionally commented out; schema is managed by migrations.

### Route mount map

| Mount path        | Router file                  | Notes |
| ----------------- | ---------------------------- | ----- |
| `/`               | inline handler               | health check JSON |
| `/api/users`      | `routes/user.routes.js`      | auth + user CRUD |
| `/api`            | `routes/startday.routes.js`  | exposes `POST /api/startday` |
| `/api/customers`  | `routes/customers.routes.js` | customer/dealer master |
| `/api/visits`     | `routes/visits.routes.js`    | `POST /api/visits/create-visit` |
| `/api`            | `routes/kpis.routes.js`      | exposes `GET /api/kpis` |
| `/api`            | `routes/report.routes.js`    | exposes `GET /api/reports/*` |
| `/api/cities`     | `routes/cities.routes.js`    | city master (public) |
| `/api/designations` | `routes/designations.routes.js` | designation master (public) |
| `/api/items`      | `routes/items.routes.js`     | product master |
| `/api/sale-orders`| `routes/sale.order.routes.js`| order capture |

> `routes/sales.js` is imported in `server.js` but **not mounted** (dead import).

## 2. Request lifecycle

```
HTTP request
  → cors / json / morgan
  → Router (matched by mount path + route path)
  → authenticateToken           (most routes)   – verifies "Authorization: Bearer <jwt>"
  → isAdmin / isSuperAdmin       (some routes)   – role gate
  → [multer upload]              (startday only) – parses multipart form
  → Controller                                    – business logic + Sequelize calls
  → res.json(...)
```

### Middleware (`Middlewares/`)

- **`authMiddleware.js`**
  - `authenticateToken` – reads `req.headers.authorization`, splits `"Bearer <token>"`,
    `jwt.verify` with `JWT_SECRET`, attaches the decoded payload to `req.user`
    (`{ id, email, role, name, city_id }`). Returns `401` on any failure.
  - `isAdmin` – allows only `req.user.role === "admin"`, else `403`.
  - `isSuperAdmin` – allows only `req.user.role === "superadmin"`, else `403`.
- **`multerMiddleware.js`** – `upload` = disk storage into `uploads/`,
  filename `<field>-<timestamp><ext>`, 5 MB limit, images only.

## 3. Authentication & authorization model

- **Login** (`POST /api/users/login`): looks up user by `name`, `bcrypt.compare` the
  password, updates `last_login`, signs a JWT **with no expiry** (admin login uses `1d`).
  Token is also set as a `token` cookie.
- **Roles** (`User.role` enum): `user`, `admin`, `superadmin`.
  - `user` – normal field sales person. Can manage their own customers/visits, submit start-day.
  - `admin` – read access to management endpoints gated by `isAdmin`.
  - `superadmin` – destructive operations (`PATCH` / `DELETE` on users, customers, items).
- **Reporting hierarchy**: `User.reportTo` is a self-referencing FK. Team-scoped endpoints
  (`/api/users/my-team-list`, `/api/customers/team-customers`) walk the hierarchy recursively
  (`herarchy/herarchy.js#getFlatIds`, and an in-memory recursion in `User.controller.js`).

## 4. Core business workflows

### a. Staff onboarding
`POST /api/users/register` → validates required fields → `bcrypt.hash` password →
`User.create` with `designationId` (FK → Designations) and `reportTo` (FK → manager's user id)
and `city_id` (FK → Cities).

### b. Start of day (field check-in)
`POST /api/startday` (multipart):
- `image` file part = selfie/odometer photo
- `data` JSON part = `{ location:{latitude,longitude,timeStamp}, meterReadings, isLeave }`
- If `isLeave` is true → a `Startday` row with `status: 'LEAVE'`, all field data null.
- Else → validates location + meter reading present, stores photo path + GPS + `startReading`.

### c. Customer creation
`POST /api/customers/create-customer`:
- Deduplicates on `contact` (unique).
- If the contact already exists and is owned by someone else → **ownership is reassigned**
  to the current user (`user_id` overwrite) instead of erroring.
- Otherwise a new `customers` row is created, owned by `req.user.id`.

### d. Visit logging
`POST /api/visits/create-visit`:
- Requires `customer_id`, `latitude`, `longitude`, `purpose`, `date`.
- `purpose` enum: `New`, `Mature`, `Old`, `NewPotentialCustomer`.
- Stored against `req.user.id`. Later cross-checked against the customer's stored
  lat/long in the **visit verification report** (Haversine distance, ≤100 m = "Verified").

### e. Sale order capture
`POST /api/sale-orders/create-sale-order`:
- Body: `{ customer_id, items: [{ item_id, quantity, unit_price }] }`.
- Runs in a **Sequelize transaction**: computes each `subtotal` and the order
  `total_amount` server-side, inserts the `sale_orders` master row (the `order_no`
  like `SO-2026-000123` is generated by a `beforeValidate` model hook), then
  `bulkCreate`s the `sale_order_items`. Rolls back on any error.

### f. Reporting (`/api/reports/*`)
All report endpoints are read-only aggregations over `Visits` + `Startday` + `Customers`
+ `User` for a `fromDate`/`toDate` window, most accepting a `names` filter
(comma-separated login names, or "All"):

| Endpoint | Purpose |
| -------- | ------- |
| `daily-report` | Per-day, per-salesperson visit log with start-day meter reading, photo, leave status. Groups by (date, salesperson). |
| `summary-report` | Per-day per-person counts: total / regular / follow-up / mature / new-potential visits + grand totals. Optional `region`, `userId` filters. |
| `my-report` | Logged-in user's own (or `targetUserId`'s) day-by-day activity. |
| `meterreading-report` | One user's daily start meter readings + photo + present/leave status. |
| `visit-verification-report` | GPS cross-check: distance between visit coords and customer's stored coords; flags Verified / Location Mismatch / Unverified. |
| `visit-count-report` | Aggregated visit counts per (salesperson, customer) with last visit date and latest purpose. |

### g. KPIs
`GET /api/kpis` → totals for users, customers, visits, and "active users"
(logged in within the last 30 days).
