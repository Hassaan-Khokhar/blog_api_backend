# 🧪 End-to-End Testing Data & Flow

This file contains all the JSON payloads and testing steps required to test the entire Blog API from scratch, simulating a real economy. Follow these steps in Postman or Thunder Client.

---

## 👥 1. Create Users (Sign Up)
**Endpoint:** `POST /api/auth/signup`
*(Note: We updated the User validation! Usernames must now be Alphabetical with maximum 3 spaces. No numbers or symbols!)*

**User 1 (The Author)**
```json
{
    "username": "Tech Guru",
    "email": "guru@test.com",
    "password": "password123"
}
```

**User 2 (The Rich Reader)**
```json
{
    "username": "Big Spender",
    "email": "rich@test.com",
    "password": "password123"
}
```

**User 3 (The Broke Reader)**
```json
{
    "username": "Broke Student",
    "email": "broke@test.com",
    "password": "password123"
}
```

**User 4 (The Casual Reader)**
```json
{
    "username": "Casual Reader",
    "email": "casual@test.com",
    "password": "password123"
}
```

---

## 🔑 2. Login & Grab Tokens
**Endpoint:** `POST /api/auth/login`

Log in as **Tech Guru** (User 1) and **Big Spender** (User 2). Copy their `accessToken`s. 
*You will need to set these in Postman's "Authorization" tab -> "Bearer Token" for the protected routes below.*
```json
{
    "email": "guru@test.com",
    "password": "password123"
}
```

---

## 💰 3. Recharge Wallets (Enterprise Transaction Testing)
**Endpoint:** `POST /api/users/recharge` (Requires JWT)

Log in as **Big Spender**, use their token, and give them $1000. *(This will securely use the ACID MongoDB Transaction logic)*.
```json
{
    "amount": 1000
}
```
*(Do not recharge Broke Student, so we can test the insufficient funds error later).*

---

## 📝 4. Seed the Blogs (Create 15+ Blogs)
**Endpoint:** `POST /api/blogs` (Requires JWT)

Log in as **Tech Guru**, use their token, and run these 15 payloads one by one to populate your database.

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

**Blog 6 (Paid - $50)**
```json
{
    "title": "AI Programming with Python",
    "snippet": "Build your first neural network.",
    "body": "Artificial intelligence is taking over. Learn how to train models using PyTorch and TensorFlow.",
    "isPaid": true,
    "price": 50
}
```

**Blog 7 (Free)**
```json
{
    "title": "CSS Grid vs Flexbox",
    "snippet": "Which one should you use?",
    "body": "Flexbox is for 1-dimensional layouts (rows OR columns). Grid is for 2-dimensional layouts (rows AND columns).",
    "isPaid": false
}
```

**Blog 8 (Paid - $5)**
```json
{
    "title": "HTML5 Best Practices",
    "snippet": "Write semantic HTML for better SEO.",
    "body": "Stop using divs for everything. Use article, section, header, and footer tags so Google can read your site.",
    "isPaid": true,
    "price": 5
}
```

**Blog 9 (Paid - $20)**
```json
{
    "title": "Docker for Beginners",
    "snippet": "Containerize your Node.js apps.",
    "body": "Docker makes it easy to run your app anywhere. Just write a Dockerfile, build the image, and run the container.",
    "isPaid": true,
    "price": 20
}
```

**Blog 10 (Free)**
```json
{
    "title": "Regex Basics",
    "snippet": "Stop being afraid of Regular Expressions.",
    "body": "Regex looks scary but it's just pattern matching. ^ means start, $ means end, and .* means anything.",
    "isPaid": false
}
```

**Blog 11 (Paid - $30)**
```json
{
    "title": "Master Kubernetes",
    "snippet": "Scale your Docker containers.",
    "body": "K8s is the industry standard for orchestrating microservices. Learn pods, deployments, and services.",
    "isPaid": true,
    "price": 30
}
```

**Blog 12 (Paid - $100)**
```json
{
    "title": "How to Start a SaaS",
    "snippet": "From zero to $10k MRR.",
    "body": "Building a Software as a Service company requires marketing just as much as coding. Find a niche first.",
    "isPaid": true,
    "price": 100
}
```

**Blog 13 (Free)**
```json
{
    "title": "Python vs JS in 2026",
    "snippet": "Which language wins?",
    "body": "Python dominates AI and Data Science. JS dominates the Web. Learn both if you want to be full-stack.",
    "isPaid": false
}
```

**Blog 14 (Paid - $12)**
```json
{
    "title": "TypeScript Crash Course",
    "snippet": "Add static typing to your JS apps.",
    "body": "TypeScript catches bugs before you even run your code. Interfaces and Types are your best friends.",
    "isPaid": true,
    "price": 12
}
```

**Blog 15 (Paid - $25)**
```json
{
    "title": "Advanced Mongoose Schemas",
    "snippet": "Virtuals, Hooks, and Methods.",
    "body": "Mongoose is more than just defining data. You can run pre-save hooks to hash passwords automatically.",
    "isPaid": true,
    "price": 25
}
```

---

## 🔍 5. Test Pagination & Lightning Fast Text Search (No Token Needed)
Now that the database is full, test the public routes:

1. **GET** `/api/blogs?page=1&limit=5` (Should return the 5 newest blogs, handled perfectly by the page/limit logic)
2. **GET** `/api/blogs?page=2&limit=5` (Should return the next 5)
3. **GET** `/api/blogs?search=React` (Will now instantly hit your new **MongoDB Text Index** and return Blog #2)

---

## 🛒 6. Test Purchasing Economy (Double-Entry Ledger)
**Endpoint:** `POST /api/blogs/:id/purchase` (Requires JWT)

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
**Endpoint:** `GET /api/blogs/:id`

Using the same `_id` of Blog #3:
1. Try fetching it with **Broke Student's** token (or no token).
   - *Result: You only see the title/snippet, body is hidden.*
2. Try fetching it with **Big Spender's** token.
   - *Result: The Compound Index instantly checks the Transaction Ledger, verifies ownership, and returns the full body!*

---

## 🏦 8. Test the Financial Ledgers (Pre-Sorted Search)
**Endpoint:** `GET /api/users/transactions` (Requires JWT)

1. Check **Big Spender's** token.
   - *Result: A `DEPOSIT` of 1000, and a `PURCHASE` of 200. (Instantly pulled via the Pre-Sorted Compound Index).*
2. Check **Tech Guru's** token.
   - *Result: An `EARNING` of 200.*

---

## 🔄 9. Test Refresh Tokens
**Endpoint:** `GET /api/auth/refresh`

Wait 15 minutes (or change JWT expiration to 1m) until your Access Token expires.
Send the Refresh Token (which is stored in a cookie automatically if testing in browser, or send it in JSON body).
```json
{
    "refreshToken": "<paste_refresh_token_here>"
}
```
*Result: You receive a fresh Access Token.*
