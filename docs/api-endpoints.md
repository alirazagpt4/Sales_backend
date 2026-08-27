# API Endpoints

Base URL (local): `http://localhost:5000`
Auth header (where required): `Authorization: Bearer <jwt>`

Auth column legend: **Public** · **Auth** (any valid token) · **Admin** (`role=admin`) ·
**SuperAdmin** (`role=superadmin`).

---

## Health

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/` | Public | `{ "message": "Sales App is Running perfectly" }` |
| GET | `/public/:filename` | Public | Serves uploaded files from `uploads/` (e.g. start-day photos) |

---

## Users — `/api/users` (`routes/user.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/users/register` | Public* | Create a user. *No middleware on the route — README says admin-only but it is not enforced.* Required body fields listed in [schemas.md](./schemas.md). |
| POST | `/api/users/login` | Public | Login by `name` + `password`. Returns JWT (no expiry) + user object. Sets `token` cookie, updates `last_login`. |
| POST | `/api/users/admin/login` | Public | Login for `admin`/`superadmin` only. Returns `{ token, username, fullname, userRole }`, token `expiresIn: 1d`. |
| GET | `/api/users/my-team-list` | Auth | The logged-in user + all recursive subordinates: `{ success, teamMembers: [{ id, name }] }`. |
| GET | `/api/users/` | Auth | Paginated user list. Query: `page` (1), `limit` (10, max 100), `search` (name/email/role/fullname/mobile). Includes city name, designation, manager, subordinates. |
| GET | `/api/users/:id` | Admin | Single user detail incl. `last_login`, city name, designation, manager, subordinates. |
| PATCH | `/api/users/:id` | SuperAdmin | Partial update (name, email, password→re-hashed, role, city_id, designation, designationId, fullname, phones, region, reportTo). |
| DELETE | `/api/users/:id` | SuperAdmin | Delete a user. |
| GET | `/api/users/protected` | Auth | Token-check echo. *Unreachable — the `/:id` GET route is declared earlier and matches `protected` first.* |

---

## Customers — `/api/customers` (`routes/customers.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/customers/create-customer` | Auth | Create a customer, owned by `req.user.id`. Dedupe on `contact`; if contact exists under another owner, ownership is reassigned and `200` returned. |
| GET | `/api/customers/` | Auth | Paginated list. Query: `page` (1), `limit` (10), `search` (customer_name/contact/area/creator name). Adds `cityName`, `createdBy`. |
| GET | `/api/customers/by-city` | Auth | Customers matching the caller's `city_id` **and** `user_id` (their own, in their city). |
| GET | `/api/customers/team-customers` | Auth | Customers owned by anyone in the caller's reporting hierarchy. Query: `page` (1), `limit` (20), `search` (customer_name/contact/creator fullname). |
| GET | `/api/customers/:id` | Auth | Single customer by id. |
| PATCH | `/api/customers/:id` | SuperAdmin | Update customer fields. |
| DELETE | `/api/customers/:id` | SuperAdmin | Delete customer. |

> Route order caveat: `/by-city` and `/team-customers` are declared **after** `/` but
> **before** `/:id`, so they resolve correctly.

---

## Visits — `/api/visits` (`routes/visits.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/visits/create-visit` | Auth | Create a visit for the logged-in user. Required: `customer_id, latitude, longitude, purpose, date`. Returns `{ message, visit }`. |

---

## Start day — `/api/startday` (`routes/startday.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/startday` | Auth | `multipart/form-data` with `image` (file) + `data` (JSON string). Creates a `PRESENT` record (photo + GPS + meter reading) or a `LEAVE` record when `data.isLeave` is true. |

---

## KPIs — `/api` (`routes/kpis.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/kpis` | Auth | `{ status, data: { totalCustomers, totalUsers, totalVisits, activeUsers } }`. `activeUsers` = logins in last 30 days. |

---

## Reports — `/api` (`routes/report.routes.js`)

All require **Auth**. All take `fromDate` & `toDate` (`YYYY-MM-DD`) unless noted.

| Method | Path | Query params | Description |
| ------ | ---- | ------------ | ----------- |
| GET | `/api/reports/daily-report` | `fromDate`, `toDate`, `names` (CSV of login names or `All`) | Per (date, salesperson) group: meter reading, start photo/location, leave status, and the day's visits. `meta` has visit counts by purpose. |
| GET | `/api/reports/summary-report` | `fromDate`, `toDate`, `region?`, `userId?` | Per-day per-person visit counts (regular/followup/mature/newPotential) + `grand_summary`. |
| GET | `/api/reports/my-report` | `fromDate`, `toDate`, `targetUserId?` | Logged-in user's (or target's) day-by-day activities + meter reading + present/leave/absent. |
| GET | `/api/reports/meterreading-report` | `name` (fullname or login name), `fromDate`, `toDate` | One user's daily start readings, photo, present/leave. |
| GET | `/api/reports/visit-verification-report` | `fromDate`, `toDate`, `names` | GPS check: Haversine distance between visit coords and customer coords; flags `Verified` (≤100 m) / `Location Mismatch` / `Unverified`. |
| GET | `/api/reports/visit-count-report` | `fromDate`, `toDate`, `names` | Aggregated visit count per (salesperson, customer) with `last_visit` and `latest_purpose`. Filters on `visits.date`. |
| GET | `/api/reports/sales-person-wise-dvr-report` | `name`/`names` (single fullname or login name), `fromDate`, `toDate` | One salesperson's daily vehicle-run (DVR): per-day meter reading, previous reading, `daily_km` (delta vs. last valid non-leave reading, carried across leave days), visited customers/cities, and visit count. `meta` has `total_km_traveled`. |
| GET | `/api/reports/test-route` | — | Returns `"Router is working!"` (no auth). |

---

## Cities — `/api/cities` (`routes/cities.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/cities/` | Public | All cities: `[{ id, name, createdAt, updatedAt }]`. |

---

## Designations — `/api/designations` (`routes/designations.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| GET | `/api/designations/` | Public | All designations: `[{ id, designation, ... }]`. |

---

## Items — `/api/items` (`routes/items.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/items/create-items` | SuperAdmin | Create item `{ item_code, item_name, price }`; `price` must be > 0; `item_code` unique. |
| GET | `/api/items/` | Public | Paginated list. Query: `page` (1), `size` (10), `search` (item_code/item_name). Returns `{ totalItems, items, totalPages, currentPage }`. |
| GET | `/api/items/:id` | Public | Single item. |
| PATCH | `/api/items/:id` | SuperAdmin | Update item fields. |
| DELETE | `/api/items/:id` | SuperAdmin | Delete item. |

---

## Sale orders — `/api/sale-orders` (`routes/sale.order.routes.js`)

| Method | Path | Auth | Description |
| ------ | ---- | ---- | ----------- |
| POST | `/api/sale-orders/create-sale-order` | Auth | Body `{ customer_id, items: [{ item_id, quantity, unit_price }] }`. Transactional; computes subtotals + total; auto `order_no`. |
| GET | `/api/sale-orders/` | Auth | Paginated orders. Query: `page` (1), `limit` (10), `search` (order_no / customer name). Includes customer, sales person name, line items + item names. Returns `{ success, total, orders }`. |

---

## Standard error responses

| Status | Meaning |
| ------ | ------- |
| 400 | Missing/invalid body or query params |
| 401 | Missing/invalid JWT |
| 403 | Authenticated but wrong role (`isAdmin` / `isSuperAdmin`) |
| 404 | Resource not found |
| 409 | Duplicate (e.g. user `name` already exists) |
| 500 | Unhandled server / DB error (`{ error: "..." }`) |
