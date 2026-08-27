# Database Design

MySQL, managed through Sequelize models + `sequelize-cli` migrations (`migrations/*.cjs`).
Every table carries Sequelize `createdAt` / `updatedAt` `DATETIME` columns unless noted.

## ER overview

```
Designations ─1───∞─ Users ──1──∞─ Startdays
                     │  │  │
                     │  │  └────1──∞─ Visits ──∞──1── Customers ──∞──1── Cities
                     │  │                                │
                     │  └── reportTo (self-ref, manager) │
                     │                                    └── user_id (owner / creator)
                     └── city_id ─────────────────────────────── Cities

Users ─1──∞─ SaleOrders ─1──∞─ SaleOrderItems ─∞──1─ Items
Customers ─1──∞─ SaleOrders
```

## Tables

### `Users`
Sales staff and administrators.

| Column | Type | Notes |
| ------ | ---- | ----- |
| id | INT PK AI | |
| name | STRING UNIQUE, nullable | login username |
| fullname | STRING NOT NULL | display name |
| email | STRING UNIQUE, nullable | `isEmail` validation |
| password | STRING NOT NULL | bcrypt hash |
| role | ENUM('admin','user','superadmin') | default `user` |
| last_login | DATETIME nullable | set on each login |
| designation | STRING nullable | free-text (legacy) |
| designationId | INT FK → `Designations.id` | ON DELETE SET NULL |
| reportTo | INT FK → `Users.id` (self) | manager; ON DELETE SET NULL |
| referred_to | STRING nullable | |
| city_id | INT FK → `Cities.id` | ON DELETE SET NULL |
| region | STRING nullable | |
| mobile_ph | STRING UNIQUE, nullable | |
| whatsapp_ph | STRING UNIQUE, nullable | |

### `Cities`
Static master list (seeded with Pakistani cities).

| Column | Type | Notes |
| id | INT PK AI | |
| name | STRING NOT NULL UNIQUE | |

### `Designations`
Static master list of job titles (seeded: Sales Executive, Senior Sales Executive,
Territory Manager, Area Sales Manager, Zonal Sales Manager, Business Development Manager).

| Column | Type | Notes |
| id | INT PK AI | |
| designation | STRING NOT NULL UNIQUE | |

### `customers`
Customer / dealer / farmer master. `freezeTableName` → literally `customers`.

| Column | Type | Notes |
| id | INT PK AI | (clients may pass an explicit id on create) |
| customer_name | STRING NOT NULL | |
| contact | STRING NOT NULL UNIQUE | phone; dedupe key |
| area | STRING nullable | |
| tehsil | STRING nullable | |
| district / division / province | STRING nullable | |
| region | STRING nullable | |
| bags_potential | INT nullable | estimated demand |
| type | ENUM('Farmer','Dealer') NOT NULL | |
| city_id | INT FK → `Cities.id` | ON DELETE SET NULL |
| user_id | INT nullable | owning / creating sales person (`Users.id`) |
| latitude | DECIMAL(10,8) nullable | reference location for visit verification |
| longitude | DECIMAL(11,8) nullable | |

### `visits`
One field visit by a user to a customer. `freezeTableName` → `visits`.

| Column | Type | Notes |
| id | INT PK AI | |
| customer_id | (model: STRING; migration FK: INT → `customers.id`) | see quirks |
| user_id | INT NOT NULL FK → `Users.id` | ON DELETE CASCADE |
| latitude | FLOAT NOT NULL | captured at visit |
| longitude | FLOAT NOT NULL | |
| purpose | ENUM('New','Mature','Old','NewPotentialCustomer') nullable | |
| date | DATEONLY NOT NULL | |
| remarks | STRING nullable | |
| timestamp | DATETIME default CURRENT_TIMESTAMP | added by migration |

### `Startdays`
Start-of-day check-in / leave record. Model name `Startday` → default plural `Startdays`.

| Column | Type | Notes |
| id | INT PK AI | |
| userId | INT NOT NULL | `Users.id` (no DB FK constraint declared in model) |
| location_latitude | FLOAT nullable | |
| location_longitude | FLOAT nullable | |
| location_timeStamp | DATETIME nullable | client-supplied timestamp |
| startReading | STRING nullable | odometer / meter reading |
| photoUri | STRING nullable | path under `uploads/` |
| is_leave | BOOLEAN NOT NULL default false | |
| status | ENUM('PRESENT','LEAVE') default 'PRESENT' | |
| leave_reason | STRING nullable | |

### `Items`
Product master.

| Column | Type | Notes |
| id | INT PK AI | |
| item_code | STRING NOT NULL UNIQUE | |
| item_name | STRING NOT NULL | |
| price | DECIMAL(10,2) NOT NULL | must be > 0 (app-level check) |

### `sale_orders`
Order master. `freezeTableName` → `sale_orders`.

| Column | Type | Notes |
| id | INT PK AI | |
| order_no | STRING NOT NULL UNIQUE | generated `SO-<year>-<6digit>` via `beforeValidate` hook |
| customer_id | STRING NOT NULL | `customers.id` (stored as string, no DB FK) |
| user_id | INT NOT NULL | `Users.id` |
| total_amount | DECIMAL(15,2) default 0.00 | computed server-side |
| status | ENUM | model: `new,processing,dispatched,delivered,cancelled`; migration: `new,pending,completed,cancelled` (mismatch) |
| order_date | DATEONLY | default NOW |

### `sale_order_items`
Order line items. `freezeTableName` → `sale_order_items`.

| Column | Type | Notes |
| id | INT PK AI | |
| order_id | INT NOT NULL FK → `sale_orders.id` | ON DELETE CASCADE |
| item_id | INT NOT NULL | `Items.id` (FK commented out in migration) |
| quantity | INT NOT NULL | default 1 |
| unit_price | DECIMAL(15,2) NOT NULL | |
| subtotal | DECIMAL(15,2) NOT NULL | `quantity * unit_price`, computed server-side |

## Associations (`models/associations.js`)

| Parent | Child | Alias | FK |
| ------ | ----- | ----- | -- |
| Designation | User | `users` / `designationDetails` | `designationId` |
| User | User | `manager` / `subordinates` | `reportTo` |
| User | Visits | `userVisits` / `user` | `user_id` |
| Customers | Visits | `customerVisits` / `customer` | `customer_id` |
| User | Startday | `startdays` / `user` | `user_id` *(see quirks)* |
| City | User | `cityDetails` | `city_id` |
| City | Customers | `cityDetails` | `city_id` |
| User | Customers | `userDetails` | `user_id` |
| User | SaleOrder | `userOrders` / `userDetails` | `user_id` |
| Customers | SaleOrder | `customerOrders` / `customerDetails` | `customer_id` |
| SaleOrder | SaleOrderItem | `items` | `order_id`, ON DELETE CASCADE |
| Items | SaleOrderItem | `itemDetails` | `item_id` |

## Known schema quirks / gotchas

- **Table name casing is inconsistent.** `Users`, `Cities`, `Designations`, `Items`,
  `Startdays` are PascalCase (Sequelize default pluralization); `customers`, `visits`,
  `sale_orders`, `sale_order_items` are forced lowercase via `freezeTableName`. Works on
  MySQL with case-insensitive `lower_case_table_names`, can break on Linux otherwise.
- **`visits.customer_id` type mismatch.** The migration creates it as `INT` with an FK to
  `customers.id`, but `visits.model.js` and `saleorder.model.js` declare `customer_id` as
  `STRING`. Sequelize coerces, but joins rely on loose typing.
- **`sale_orders.status` enum differs** between the model and the migration.
- **`Startday` association** in `associations.js` uses `foreignKey: 'user_id'`, but the model
  column is `userId`. Controllers query `Startday` with `where: { userId }` directly and do
  not rely on the association, so this is latent.
- **No dedicated "create Users table" migration** — `migrations/20251203074545-initial-tables-record.cjs`
  is an empty stub. The `Users` table was created out-of-band (likely an early `sequelize.sync()`),
  and later migrations `addColumn` onto it.
- **JWTs from the normal login have no expiry** (`loginUser`); only `loginAdmin` sets `1d`.
- Folder is spelled `herarchy/` (sic).
