# 🚀 Enterprise Blog API (with Digital Economy)

A production-ready, highly secure RESTful API built with **Node.js, Express, and MongoDB**. 

This is not a standard CRUD application. This API features a **fully functional digital economy**, allowing users to create digital wallets, recharge funds, and purchase premium content from other authors using a double-entry accounting system secured by **ACID Database Transactions**.

---

## 🌟 Key Enterprise Features

- **Decoupled Architecture:** Strict separation of concerns using the Controller-Service-Model pattern.
- **ACID Financial Transactions:** Uses Mongoose Sessions (`startTransaction`, `commitTransaction`, `abortTransaction`) to guarantee that funds are never lost during server crashes.
- **Bulletproof Error Handling:** A centralized, global error-handling middleware that intercepts and formats native Mongoose errors (`CastError`, `ValidationError`, `11000 Duplicate Key`) and `JsonWebToken` errors into clean API responses.
- **Strict Data Validation:** All incoming requests are sanitized and validated using **Joi** schemas (including Strict Regex pattern filtering) before reaching the controllers.
- **High-Performance Search:** Uses native **MongoDB Text Indexes** (`$text`) to provide lightning-fast, full-text searching without triggering expensive collection scans.
- **Enterprise Referential Architecture:** Eliminates MongoDB anti-patterns (like unbounded arrays) by utilizing **Compound Indexes** and referential lookups for access control and transaction sorting.
- **Robust Security:** Implements `helmet` for HTTP header security and `express-rate-limit` to block brute-force bot attacks.
- **JWT Authentication:** Secure user sessions using short-lived Access Tokens and long-lived Refresh Tokens.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB & Mongoose
- **Validation:** Joi
- **Security:** Helmet, express-rate-limit, bcrypt, jsonwebtoken

---

## 📖 API Endpoints

### 🔐 Authentication (`/api/users`)
- `POST /signup` - Register a new user (Validates email & password strength)
- `POST /login` - Authenticate and receive Access & Refresh tokens
- `GET /refresh` - Generate a new Access Token using a valid Refresh Token
- `POST /logout` - Invalidate the current session
- `POST /logoutAll` - Revoke all active sessions across all devices

### 💰 Digital Economy (`/api/users`)
- `POST /recharge` - Add funds to the authenticated user's wallet
- `GET /transactions` - Fetch a paginated ledger of all financial receipts (Earnings & Purchases)

### ✍️ Blogs (`/api/blogs`)
- `GET /` - Fetch all blogs (Supports `?page`, `?limit`, and `?search` queries)
- `GET /:id` - Read a specific blog. **Note:** If the blog is `isPaid: true`, the body is hidden unless the viewer is the author or has purchased it.
- `GET /author/:author` - Fetch all blogs by a specific user
- `POST /` - Create a new free or premium blog
- `POST /:id/purchase` - Purchase a premium blog. Automatically deducts funds from the buyer, credits the author, and generates immutable `Transaction` receipts.
- `PUT /:id` / `PATCH /:id` - Update an existing blog
- `DELETE /:id` - Delete a blog

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd blog-api-project
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory and configure your secrets:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
NODE_ENV=development
```

### 4. Start the Server
```bash
# Development Mode (Nodemon)
npm run dev

# Production Mode
npm start
```

---

## 🛡️ Architecture & Design Decisions

- **Why Double-Entry Accounting?** When a blog is purchased, we don't just change wallet balances. We generate two immutable `Transaction` records (a `PURCHASE` for the buyer, an `EARNING` for the author) to create an auditable financial ledger.
- **Why No "purchasedBy" Array?** Storing a massive array of users inside a Blog document causes the "Unbounded Array" anti-pattern, which crashes the database when it hits 16MB. Instead, this API queries the Transaction Ledger using a Compound Index to verify ownership.
- **Why Text Indexes?** Standard `$regex` searching forces MongoDB to do a Collection Scan (O(N)), which severely damages performance. Text Indexes create an optimized dictionary for instant search results.
- **Why Joi?** Mongoose validation only runs *after* data reaches the database layer. Joi intercepts bad data at the routing layer, protecting the server from processing invalid requests.
- **Why Global Error Handling?** Controllers are wrapped in a custom `asyncHandler`. This completely eliminates the need for `try/catch` blocks in controllers, resulting in highly readable, declarative code.
