# 🧪 End-to-End Testing Data & Flow (Including Stripe)

This file contains all the JSON payloads and testing steps required to test the entire Blog API from scratch, simulating a real economy with real Stripe interactions. Follow these steps in Postman or Thunder Client.

---

## 👥 1. Create Users (Sign Up)
**Endpoint:** `POST /api/users/signup`
*(Note: Usernames must be alphabetical with a maximum of 3 spaces. No numbers or symbols!)*

**User 1 (The Author)**
```json
{
    "username": "Tech Guru",
    "email": "guru@test.com",
    "password": "password123!",
    "firstName": "Tech",
    "lastName": "Guru"
}
```

**User 2 (The Rich Reader)**
```json
{
    "username": "Big Spender",
    "email": "rich@test.com",
    "password": "password123!",
    "firstName": "Big",
    "lastName": "Spender"
}
```

**User 3 (The Broke Reader)**
```json
{
    "username": "Broke Student",
    "email": "broke@test.com",
    "password": "password123!",
    "firstName": "Broke",
    "lastName": "Student"
}
```

---

## 🔑 2. Login & Authenticate
**Endpoint:** `POST /api/users/login`

Log in as **Tech Guru** (User 1) and **Big Spender** (User 2). 
*(Note: Your backend sets the `accessToken` in HTTP-Only Cookies automatically! Postman will pass it for you behind the scenes for all protected routes below).*
```json
{
    "email": "guru@test.com",
    "password": "password123!"
}
```

---

## 💳 3. Recharge Wallets (Stripe Inbound Finance)
**Endpoint:** `POST /api/transactions/recharge` (Requires Cookie)

Log in as **Big Spender** and give them $1000 using Stripe's magic test token `tok_visa`. *(This automatically provisions their Stripe Customer ID behind the scenes and uses ACID MongoDB Transactions to update the ledger).*
```json
{
    "amount": 1000,
    "paymentSource": "tok_visa",
    "isSavedCard": false,
    "shouldSaveCard": false
}
```
*(Do not recharge Broke Student, so we can test the insufficient funds error later).*

---

## 📝 4. Seed the Blogs (Create 15+ Blogs)
**Endpoint:** `POST /api/blogs` (Requires Cookie)

Log in as **Tech Guru** and run these payloads to populate your database.

**Blog 1 (Free)**
```json
{
    "title": "Welcome to my Tech Blog",
    "snippet": "This is my very first post about coding.",
    "body": "Hello world! This is a completely free blog post that anyone can read without paying. Enjoy!",
    "isPaid": false
}
```

**Blog 2 (Paid - $10)**
```json
{
    "title": "Learn React in 10 Minutes",
    "snippet": "The ultimate shortcut to learning React.js fast.",
    "body": "Here is the highly guarded secret to learning React. First, understand components. Second, master state. Third, use hooks!",
    "isPaid": true,
    "price": 10
}
```

**Blog 3 (Paid - $200)**
```json
{
    "title": "Advanced Node.js Architecture",
    "snippet": "How to build enterprise APIs that scale.",
    "body": "Welcome to the masterclass. Today we will discuss ACID transactions, Global Error Handling, and Joi validations in depth.",
    "isPaid": true,
    "price": 200
}
```

**Blog 4 (Paid - $15)**
```json
{
    "title": "The Future of Web3",
    "snippet": "Is cryptocurrency here to stay?",
    "body": "Web3 is changing the internet by decentralizing data. Smart contracts will replace traditional banking.",
    "isPaid": true,
    "price": 15
}
```

**Blog 5 (Free)**
```json
{
    "title": "Mastering JavaScript Arrays",
    "snippet": "Map, Filter, and Reduce explained.",
    "body": "Arrays are the most important data structure. Use map to transform data, filter to remove it, and reduce to summarize it.",
    "isPaid": false
}
```

*(You can continue creating blogs 6 through 15 using similar structures, ensuring paid blogs have `price > 0` and bodies are > 20 characters).*

---

## 🔍 5. Test Pagination & Lightning Fast Text Search
Now that the database is full, test the public routes:

1. **GET** `/api/blogs?page=1&limit=5` (Should return the 5 newest blogs)
2. **GET** `/api/blogs?page=2&limit=5` (Should return the next 5)
3. **GET** `/api/blogs?search=React` (Will now instantly hit your new **MongoDB Text Index** and return Blog #2)

---

## 🛒 6. Test Purchasing Economy (Double-Entry Ledger)
**Endpoint:** `POST /api/blogs/:id/buy` (Requires Cookie)

Grab the `_id` of Blog #3 ("Advanced Node.js Architecture" - Price: $200).

1. Log in as **Broke Student**, get token, and try to purchase.
   - *Result: 400 Bad Request ("Insufficient funds")*
2. Log in as **Tech Guru** (the author), get token, and try to purchase.
   - *Result: 400 Bad Request ("You cannot buy your own Blog")*
3. Log in as **Big Spender**, get token, and purchase.
   - *Result: 200 OK ("Purchase successful" - Wallet balances update and 2 Transactions are created)*
4. Log in as **Big Spender** and try to purchase again.
   - *Result: 400 Bad Request ("You already own this Blog!")*

---

## 📖 7. Test Access Control (Referential Lookups)
**Endpoint:** `GET /api/blogs/:id` (Optional Cookie)

Using the same `_id` of Blog #3:
1. Try fetching it with **Broke Student's** login.
   - *Result: You only see the title/snippet, body is hidden.*
2. Try fetching it with **Big Spender's** login.
   - *Result: The Compound Index instantly checks the Transaction Ledger, verifies ownership, and returns the full body!*

---

## 🏦 8. Stripe Outbound Finance (Withdrawals)

Log in as **Tech Guru** (they just earned $200 from the blog sale!) and attempt to cash out to their real bank.

**Step A: Submit Legal Identity (KYC)**
**Endpoint:** `POST /api/users/submit-kyc`
```json
{
    "legalFirstName": "Tech",
    "legalLastName": "Guru",
    "dob": { "day": 15, "month": 6, "year": 1990 },
    "address": { "line1": "123 Test Street", "city": "Sydney", "state": "NSW", "postal_code": "2000" }
}
```

**Step B: Link Bank Account**
**Endpoint:** `POST /api/transactions/add-bank`
*(Uses Stripe's magic Australian bank token `btok_au`)*
```json
{
    "bankToken": "btok_au"
}
```

**Step C: Withdraw Funds**
**Endpoint:** `POST /api/transactions/withdraw`
```json
{
    "amount": 20
}
```
*(This triggers an automated Stripe Payout for 95% of the withdrawal amount!)*

---

## 📜 9. Test the Financial Ledgers (Auditing)
**Endpoint:** `GET /api/transactions/transactions` (Requires Cookie)

1. Check **Big Spender's** ledger.
   - *Result: A `DEPOSIT` of 1000, and a `BUY` of 200.*
2. Check **Tech Guru's** ledger.
   - *Result: A `SELL` of 200, and a `WITHDRAW` of 20.*

---

## 🔄 10. Test Refresh Tokens
**Endpoint:** `GET /api/users/refresh`

Wait 15 minutes until your Access Token expires (or send request directly).
*Result: Your backend reads the HTTP-Only `refreshToken` cookie and issues a fresh Access Token automatically!*
