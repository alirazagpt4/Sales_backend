# Schemas

## Sequelize models (`models/`)

| File | Model | Table | Timestamps |
| ---- | ----- | ----- | ---------- |
| `User.js` | `User` | `Users` | yes |
| `City.js` | `City` | `cities` (`freezeTableName`) | yes |
| `designations.model.js` | `Designation` | `Designations` | yes |
| `customers.model.js` | `Customers` | `customers` (`freezeTableName`) | yes |
| `visits.model.js` | `Visits` | `visits` (`freezeTableName`) | yes |
| `startday.model.js` | `Startday` | `Startdays` | yes |
| `items.model.js` | `Item` | `Items` | yes |
| `saleorder.model.js` | `SaleOrder` | `sale_orders` (`freezeTableName`) | yes |
| `saleorderitems.model.js` | `SaleOrderItem` | `sale_order_items` (`freezeTableName`) | yes |
| `associations.js` | — | wires all relations; import for side effects | — |

Column-level detail is in [database-design.md](./database-design.md). Notable model logic:

- **`SaleOrder.beforeValidate` hook** – if `order_no` is unset, generates
  `SO-<currentYear>-<nextId zero-padded to 6>` by reading the current max id.
- **`User`** – `email` has `validate: { isEmail: true }`; `role` defaults to `"user"`.
- **`Customers` / `Visits` / `SaleOrder`** use `freezeTableName: true`.

## JWT payload

```jsonc
// signed in User.controller.js loginUser()
{ "id": 1, "email": "a@b.com", "role": "user", "name": "john", "city_id": 3 }
// loginAdmin() signs a smaller payload with { expiresIn: "1d" }
{ "id": 1, "email": "a@b.com", "role": "admin" }
```
Attached to `req.user` by `authenticateToken`. Send as `Authorization: Bearer <token>`.

## Request / response payload shapes

### Auth

**`POST /api/users/register`** (body)
```json
{
  "name": "john",
  "fullname": "John Doe",
  "password": "Password123",
  "role": "user",
  "city_id": 1,
  "designation": "Sales Officer",
  "designationId": 1,
  "reportTo": 4,
  "mobile_ph": "03001234567",
  "whatsapp_ph": "03001234567",
  "region": "Central"
}
```
Required: `name, password, city_id, designation, designationId, fullname, mobile_ph, whatsapp_ph, region`.

**`POST /api/users/login`** (body) → `{ name, password }`
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": 1, "name": "john", "email": null, "role": "user",
    "city_id": 1, "fullname": "John Doe", "designationId": 1,
    "designation": "Sales Executive", "city": "Lahore"
  }
}
```

**`POST /api/users/admin/login`** (body) → `{ name, password }` →
`{ token, username, fullname, userRole }`. Rejects non `admin`/`superadmin` with `403`.

### Customer

**`POST /api/customers/create-customer`** (body)
```json
{
  "customer_name": "ABC Store",
  "contact": "03001234567",
  "area": "Main Bazaar",
  "tehsil": "Some Tehsil",
  "bags_potential": 200,
  "type": "Dealer",
  "city_id": 1,
  "latitude": 31.5204,
  "longitude": 74.3587,
  "district": "Lahore",
  "division": "Lahore",
  "province": "Punjab",
  "region": "Central"
}
```
`type` ∈ `Farmer | Dealer`. Dedupe on `contact`; existing contact → ownership reassigned.

### Visit

**`POST /api/visits/create-visit`** (body)
```json
{
  "customer_id": 1001,
  "latitude": 31.5204,
  "longitude": 74.3587,
  "purpose": "Old",
  "date": "2026-08-27",
  "remarks": "Discussed new scheme"
}
```
Required: `customer_id, latitude, longitude, purpose, date`.
`purpose` ∈ `New | Mature | Old | NewPotentialCustomer`.

### Start day (multipart/form-data)

**`POST /api/startday`**
- `image`: file
- `data`: JSON string
```json
{
  "location": { "latitude": 31.52, "longitude": 74.35, "timeStamp": "2026-08-27T08:30:00Z" },
  "meterReadings": "12345",
  "isLeave": false
}
```
If `isLeave: true`, `location` / `meterReadings` / `image` are not required.

### Item

**`POST /api/items/create-items`** (body) → `{ item_code, item_name, price }` (`price > 0`).

### Sale order

**`POST /api/sale-orders/create-sale-order`** (body)
```json
{
  "customer_id": "1001",
  "items": [
    { "item_id": 1, "quantity": 10, "unit_price": 1500 },
    { "item_id": 2, "quantity": 5,  "unit_price": 900 }
  ]
}
```
`subtotal` and `total_amount` are computed server-side. Response:
```json
{ "success": true, "order_no": "SO-2026-000001", "total_amount": 19500, "message": "Order placed successfully!" }
```

### Common list response shapes

Paginated (customers, sale-orders):
```json
{ "data": [ ... ], "pagination": { "totalItems": 0, "totalPages": 0, "currentPage": 1, "itemsPerPage": 10 } }
```
Users list: `{ totalUsers, totalPages, currentPage, users: [...] }`.
Items list: `{ totalItems, items: [...], totalPages, currentPage }`.
