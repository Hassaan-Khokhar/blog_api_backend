# ✍️ Express.js Blog API

A robust and secure RESTful API for a blogging platform built with **Node.js**, **Express**, and **MongoDB**. 

This project demonstrates modern backend development practices, including secure user authentication using JSON Web Tokens (Access & Refresh Tokens), route protection, device management, and comprehensive CRUD operations for blog posts.

---

## 🚀 Features

*   **User Authentication:** Secure signup and login functionality utilizing `bcrypt` for password hashing.
*   **JWT Authorization:** Implementation of JSON Web Tokens for secure route access and API protection.
*   **Advanced Token Rotation:** Uses short-lived Access Tokens (15 min) and long-lived Refresh Tokens (30 days) stored securely in HTTP-only cookies.
*   **Device Management:** 
    *   Ability for users to log out of a single device.
    *   Securely log out of all devices at once by revoking all active refresh tokens.
*   **Blog Management:** Complete CRUD (Create, Read, Update, Delete) functionality for blog posts.
*   **Author Association:** Blogs are tied to their creators via database references, preventing unauthorized edits or deletions.
*   **Global Error Handling:** Clean and consistent error responses using custom async handlers.

---

## 🛠️ Tech Stack

*   **Runtime:** Node.js
*   **Framework:** Express.js
*   **Database:** MongoDB (Object modeling via Mongoose)
*   **Authentication:** JSON Web Tokens (JWT) & Cookie Parser
*   **Security:** Bcrypt (Password Hashing)
*   **Development:** Nodemon

---

## ⚙️ Installation & Setup

### Prerequisites
Make sure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/en/) (v14 or higher)
*   [MongoDB](https://www.mongodb.com/) (Local installation or MongoDB Atlas URI)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/express-blog-api.git
cd express-blog-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory of the project and add the following variables. **Never commit your `.env` file to version control.**

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key
NODE_ENV=development
```

### 4. Start the development server
```bash
npm run dev
```
The server will start running on `http://localhost:5000`.

---

## 📁 Project Structure

```text
├── controllers/
│   ├── blogController.js    # Logic for blog routes
│   └── userController.js    # Logic for authentication routes
├── middlewares/
│   └── requireAuth.js       # Middleware to verify JWT and protect routes
├── models/
│   ├── blogModel.js         # Mongoose schema for Blogs
│   └── userModel.js         # Mongoose schema for Users
├── routes/
│   ├── authRoutes.js        # Express routes for authentication
│   └── blogRoutes.js        # Express routes for blogs
├── utils/
│   └── asyncHandler.js      # Wrapper to handle async/await try-catch blocks
├── .env                     # Environment variables (ignored in git)
├── db.js                    # MongoDB connection setup
├── index.js                 # Entry point of the application
└── package.json             # Project dependencies and scripts
```

---

## 📡 API Endpoints

### 🔐 Authentication (`/api/users`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/signup` | Register a new user account. | No |
| `POST` | `/login` | Authenticate user and set HTTP-only cookies. | No |
| `GET` | `/refresh` | Generate a new access token using a valid refresh token. | No |
| `POST` | `/logout` | Log out of the current device (clears cookies). | No |
| `POST` | `/logoutAll` | Revoke all refresh tokens and log out of all devices. | **Yes** |

#### Example: Login Request
```json
// POST /api/users/login
{
  "email": "user@example.com",
  "password": "mySecurePassword123"
}
```

### 📝 Blogs (`/api/blogs`)

*Note: All blog routes require a valid Access Token.*

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Get all blog posts (sorted by newest). | **Yes** |
| `GET` | `/:id` | Get a specific blog post by its ID. | **Yes** |
| `GET` | `/author/:author` | Get all blog posts created by a specific user ID. | **Yes** |
| `POST` | `/` | Create a new blog post. | **Yes** |
| `PUT` | `/:id` | Update an existing blog post (Must be the owner). | **Yes** |
| `DELETE` | `/:id` | Delete a blog post (Must be the owner). | **Yes** |

#### Example: Create Blog Request
```json
// POST /api/blogs/
{
  "title": "My First Blog API",
  "body": "This is the main content of the blog post...",
  "snippet": "A short summary of the blog"
}
```

---

## 🛡️ Security Implementation Details

1. **Password Protection:** User passwords are never stored in plain text. They are hashed using `bcrypt` with a salt round of 10 before saving to the database.
2. **Token Storage:** To prevent Cross-Site Scripting (XSS) attacks, Access Tokens and Refresh Tokens are sent to the client via **HTTP-only, strict same-site cookies**.
3. **Session Revocation:** The `logoutAll` endpoint clears the array of active refresh tokens in the database, instantly invalidating all active sessions for that user across all devices.
4. **Data Ownership:** Update and Delete blog operations verify that the `userId` attached to the decoded JWT matches the `userId` stored on the blog document.

---

*Built for learning and demonstrating Express.js API capabilities.*
