## Sales Backend – API Routes Overview

Base URL (local): `http://localhost:5000`

All main APIs are mounted under `/api` as shown in `server.js`.

### 1. Health / Root
- **GET /**  
  - **Description**: Simple health check of the backend.  
  - **Response example**:
    ```json
    {
      "message": "Sales App is Running perfectly"
    }
    ```

---

### 2. User Routes (`/api/users`)

- **POST /api/users/register**  
  - **Auth**: Requires JWT, admin only.  
  - **Description**: Create a new user (sales person/admin etc.).  
  - **Body example**:
    ```json
    {
      "name": "john",
      "email": "john@example.com",
      "password": "Password123",
      "role": "user",
      "city_id": 1,
      "designation": "Sales Officer",
      "referred_to": "Manager Name",
      "fullname": "John Doe",
      "mobile_ph": "03001234567",
      "whatsapp_ph": "03001234567"
    }
    ```

- **POST /api/users/login**  
  - **Description**: Login for normal user (by `name` + `password`), returns JWT token and user info.  
  - **Body example**:
    ```json
    {
      "name": "john",
      "password": "Password123"
    }
    ```

- **POST /api/users/admin/login**  
  - **Description**: Login for admin user only (must have role `admin`). Returns JWT token.  
  - **Body example**:
    ```json
    {
      "name": "admin",
      "password": "AdminPass123"
    }
    ```

- **GET /api/users/**  
  - **Auth**: Admin only.  
  - **Query params** (optional):  
    - `page` (number, default 1)  
    - `limit` (number, default 30)  
    - `search` (filter by name/email/role)  
  - **Description**: Paginated list of all users with city name and other profile fields.

- **GET /api/users/:id**  
  - **Auth**: Admin only.  
  - **Description**: Get detailed info for a single user including last login and city name.

- **PATCH /api/users/:id**  
  - **Auth**: Admin only.  
  - **Description**: Update user fields (name, email, password, role, city, phones, etc.).  
  - **Body example (partial)**:
    ```json
    {
      "email": "new-email@example.com",
      "role": "admin"
    }
    ```

- **DELETE /api/users/:id**  
  - **Auth**: Admin only.  
  - **Description**: Delete a user by ID.

- **GET /api/users/protected**  
  - **Auth**: Any authenticated user.  
  - **Description**: Test/protected route to verify JWT token is working.

---

### 3. Customer Routes (`/api/customers`)

- **POST /api/customers/create-customer**  
  - **Auth**: Any authenticated user.  
  - **Description**: Create a new customer/shop.  
  - **Body example**:
    ```json
    {
      "id": 1001,
      "customer_name": "ABC Store",
      "contact": "03001234567",
      "area": "Main Bazaar",
      "tehsil": "Some Tehsil",
      "bags_potential": 200,
      "type": "Retailer",
      "city_id": 1,
      "latitude": 31.5204,
      "longitude": 74.3587
    }
    ```

- **GET /api/customers/**  
  - **Auth**: Any authenticated user.  
  - **Query params** (optional):  
    - `page` (default 1)  
    - `limit` (default 10)  
    - `search` (by name, contact or area)  
  - **Description**: Paginated list of customers, including city name and basic info.

- **GET /api/customers/by-city**  
  - **Auth**: Any authenticated user.  
  - **Description**: List of customers filtered by logged-in user’s `city_id`.  
  - **Response**: Returns customers in that city (id, name, contact, area, type, region, latitude, longitude).

- **GET /api/customers/:id**  
  - **Auth**: Any authenticated user.  
  - **Description**: Get a single customer by ID.

- **PATCH /api/customers/:id**  
  - **Auth**: Admin only.  
  - **Description**: Update customer fields by ID (name, contact, area, etc.).  
  - **Body example (partial)**:
    ```json
    {
      "customer_name": "Updated Store",
      "area": "New Area"
    }
    ```

- **DELETE /api/customers/:id**  
  - **Auth**: Admin only.  
  - **Description**: Delete a customer by ID.

---

### 4. Visit Routes (`/api/visits`)

- **POST /api/visits/create-visit**  
  - **Auth**: Any authenticated user.  
  - **Description**: Create a visit record for the logged-in user against a customer.  
  - **Body example**:
    ```json
    {
      "customer_id": 1001,
      "latitude": 31.5204,
      "longitude": 74.3587,
      "purpose": "Follow-up",
      "date": "2025-12-23",
      "remarks": "Discussed new scheme"
    }
    ```

---

### 5. Startday Routes (`/api/startday`)

- **POST /api/startday**  
  - **Auth**: Any authenticated user.  
  - **Content-Type**: `multipart/form-data`  
  - **Description**: Submit start-of-day data (meter reading + location + selfie/photo) for the logged-in user.  
  - **Form fields**:
    - `image`: file (photo)  
    - `data`: JSON string, for example:
      ```json
      {
        "location": {
          "latitude": 31.5204,
          "longitude": 74.3587,
          "timeStamp": "2025-12-23T08:30:00Z"
        },
        "meterReadings": "12345"
      }
      ```

---

### 6. KPI Routes (`/api/kpis`)

- **GET /api/kpis**  
  - **Auth**: Admin only.  
  - **Description**: Returns KPI summary numbers: total users, total customers, total visits, active users (last 30 days).  
  - **Response example**:
    ```json
    {
      "status": "success",
      "data": {
        "totalCustomers": 100,
        "totalUsers": 10,
        "totalVisits": 500,
        "activeUsers": 7
      }
    }
    ```

---

### 7. Report Routes (`/api/reports`)

- **GET /api/reports/daily-report**  
  - **Auth**: Admin only.  
  - **Query params** (all required):  
    - `name` – user’s login name (sales person)  
    - `fromDate` – start date (e.g. `2025-12-01`)  
    - `toDate` – end date (e.g. `2025-12-23`)  
  - **Description**: Generates a grouped daily visit report for one user between the given dates, including startday info and each visit.  
  - **Response**:  
    - `meta`: sales person name, city, designation, total visits, date range  
    - `report`: array grouped by date, with meter reading, startday photo/location, and list of visits for that date.

---

### 8. Cities Routes (`/api/cities`)

- **GET /api/cities/**  
  - **Description**: Returns the list of all cities configured in the system.  
  - **Response example**:
    ```json
    [
      { "id": 1, "name": "Lahore" },
      { "id": 2, "name": "Karachi" }
    ]
    ```

---

### 9. Static Files (Uploads)

- **GET /public/<filename>**  
  - **Description**: Access uploaded files (e.g. startday images) from the `uploads` folder.  
  - **Example**: `GET http://localhost:5000/public/image-1764422783347.jpg`

---

You can also refer to your Postman collection link (above) for live examples and tests of these endpoints.
