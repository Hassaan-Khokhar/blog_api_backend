# 🚀 Enterprise Blog API (with Stripe Economy)

A production-ready, highly secure RESTful API built with Node.js, Express, and MongoDB.

This is not a standard CRUD application. This API features a **fully functional digital economy powered by Stripe**, allowing users to create digital wallets, recharge funds with credit cards, purchase premium content from other authors, and legally withdraw their earnings to real-world bank accounts. All internal ledger movements are secured by a double-entry accounting system and **ACID Database Transactions**.

## 🌟 Key Enterprise Features

* **Stripe Connect Integration (Zero-Data Liability):** The API is architected to keep PII (Personally Identifiable Information) out of your database. All sensitive financial data (credit cards, government IDs, bank accounts) is vaulted directly on Stripe's PCI-compliant infrastructure. The database is strictly stateless regarding financial identity.
* **Decoupled Architecture:** Strict Domain separation. The `User` domain handles pure identity/auth, while the `Transaction` domain handles all financial operations and Stripe coordination.
* **ACID Financial Transactions:** Uses Mongoose Sessions (`startTransaction`, `commitTransaction`, `abortTransaction`) to guarantee that funds are never lost during server crashes or schema validation failures.
* **Bulletproof Error Handling:** A centralized, global error-handling middleware that intercepts and formats native Mongoose errors (CastError, ValidationError, 11000 Duplicate Key) and Stripe API errors into clean responses.
* **Strict Data Validation:** All incoming requests are sanitized and validated using Joi schemas (including Strict Regex pattern filtering) before reaching the controllers.
* **High-Performance Search:** Uses native MongoDB Text Indexes (`$text`) to provide lightning-fast, full-text searching without triggering expensive collection scans.
* **Enterprise Referential Architecture:** Eliminates MongoDB anti-patterns (like unbounded arrays) by utilizing Compound Indexes and referential lookups for access control and transaction sorting.
* **Robust Security:** Implements `helmet` for HTTP header security and `express-rate-limit` to block brute-force bot attacks.
* **JWT Authentication:** Secure user sessions using short-lived Access Tokens and long-lived Refresh Tokens delivered securely via HTTP-Only cookies.

## 🛠️ Tech Stack

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB & Mongoose
* **Finance:** Stripe API (Charges, Custom Connect Accounts, Transfers)
* **Validation:** Joi
* **Security:** Helmet, express-rate-limit, bcrypt, jsonwebtoken

## 📖 API Endpoints

### 🔐 Authentication (`/api/users`)
* `POST /signup` - Register a new user (Validates email & password strength)
* `POST /login` - Authenticate and receive Access & Refresh tokens via cookies
* `GET /refresh` - Generate a new Access Token using a valid Refresh Token
* `POST /logout` - Invalidate the current session
* `POST /logoutAll` - Revoke all active sessions across all devices
* `POST /submit-kyc` - Submits a user's Legal Identity directly to their Stripe Custom Account for verification.

### 💰 Digital Economy & Stripe (`/api/transactions`)
* `POST /recharge` - Recharge wallet via a simulated Credit Card charge (Automatically provisions a Stripe Customer ID).
* `POST /add-bank` - Link an external Bank Account to the user's Stripe Connect account.
* `POST /withdraw` - Initiate a payout transfer from the platform wallet to a real-world bank account.
* `GET /transactions` - Fetch a paginated ledger of all financial receipts (Deposits, Earnings, Purchases, Withdrawals).

### ✍️ Blogs (`/api/blogs`)
* `GET /` - Fetch all blogs (Supports `?page`, `?limit`, and `?search` queries)
* `GET /:id` - Read a specific blog. Note: If the blog is `isPaid: true`, the body is hidden unless the viewer is the author or has purchased it.
* `GET /author/:author` - Fetch all blogs by a specific user
* `POST /` - Create a new free or premium blog
* `POST /:id/buy` - Purchase a premium blog. Automatically deducts funds from the buyer, credits the author, and generates immutable Transaction receipts via an ACID Transaction.
* `PUT /:id` / `PATCH /:id` - Update an existing blog
* `DELETE /:id` - Delete a blog

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
PORT=8000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>
JWT_SECRET=your_super_secret_access_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
NODE_ENV=development
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
```

### 4. Start the Server
```bash
# Development Mode (Nodemon)
npm run dev

# Production Mode
npm start
```

## 🛡️ Architecture & Design Decisions

* **Why Zero-Data Liability?** Storing Legal Names, Dates of Birth, and Addresses in a proprietary database creates a massive legal and security liability. By passing KYC data directly to Stripe and keeping our database stateless (storing only the `stripeAccountId`), we offload all PCI compliance and regulatory risk to Stripe's infrastructure.
* **Why Domain Separation?** User authentication and Financial ledgers are distinct responsibilities. Keeping Stripe API calls and ledger movements in `transactionService.js` prevents the `userService.js` from becoming a monolithic "God Object".
* **Why Double-Entry Accounting?** When a blog is purchased, we don't just change wallet balances. We generate two immutable Transaction records (a BUY for the buyer, a SELL for the author) to create an auditable financial ledger.
* **Why No "purchasedBy" Array?** Storing a massive array of users inside a Blog document causes the "Unbounded Array" anti-pattern, which crashes the database when it hits 16MB. Instead, this API queries the Transaction Ledger using a Compound Index to verify ownership.
* **Why Text Indexes?** Standard `$regex` searching forces MongoDB to do a Collection Scan (O(N)), which severely damages performance. Text Indexes create an optimized dictionary for instant search results.
* **Why Joi?** Mongoose validation only runs after data reaches the database layer. Joi intercepts bad data at the routing layer, protecting the server from processing invalid requests.
* **Why Global Error Handling?** Controllers are wrapped in a custom `asyncHandler`. This completely eliminates the need for try/catch blocks in controllers, resulting in highly readable, declarative code.
