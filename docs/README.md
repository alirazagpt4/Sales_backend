# Sales Backend – Documentation

Backend API for a field-sales / distribution management system (internally "FSPL Backend").
It tracks sales staff, their daily field activity (start-of-day check-in, customer visits with
GPS verification), the customer/dealer master data, product items, and sale orders, and exposes
a set of management reports and KPIs.

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Runtime        | Node.js (ES Modules, `"type": "module"`)|
| Web framework  | Express 5                               |
| ORM            | Sequelize 6                             |
| Database       | MySQL (`mysql2` driver)                 |
| Auth           | JWT (`jsonwebtoken`) + `bcrypt` hashing |
| File uploads   | `multer` (disk storage → `uploads/`)    |
| Logging        | `morgan`                                |
| Migrations     | `sequelize-cli` (`.cjs` files)          |

## Documentation index

| File | Contents |
| ---- | -------- |
| [project-flow.md](./project-flow.md) | How a request flows through the app, runtime bootstrap, auth model, and the main business workflows (onboarding, start-day, visits, orders, reporting). |
| [database-design.md](./database-design.md) | ER overview, every table, columns, relationships, and known schema quirks. |
| [schemas.md](./schemas.md) | Sequelize model definitions and request/response payload shapes. |
| [api-endpoints.md](./api-endpoints.md) | Every route: method, path, auth requirement, query/body params, and sample responses. |

## Running locally

```bash
npm install
# create .env (see below)
npm run migrate      # apply DB schema
npm run seed:all     # seed cities + designations
npm run dev          # nodemon server.js  (or: npm start)
```

### Required `.env`

```
PORT=5000
DB_NAME=your_db
DB_USER=your_user
DB_PASS=your_pass
DB_HOST=localhost
DB_DIALECT=mysql
JWT_SECRET=your_secret
```

Base URL (local): `http://localhost:5000`
