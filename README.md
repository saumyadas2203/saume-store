# SAUMÉ Store 🛍️

A full-stack MERN e-commerce web application featuring user authentication, product browsing, wishlist functionality, and an admin dashboard.

## ✨ Features

- User registration and login
- Product browsing
- Wishlist functionality
- Admin dashboard
- Authentication and protected routes
- Responsive user interface

## 🧰 Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JSON Web Tokens (JWT)

## 📁 Project Structure

```text
saume-store/
├── client/
├── server/
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database

### 1. Clone the repository

```bash
git clone https://github.com/saumyadas2203/saume-store.git
cd saume-store
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `server/.env` file using `server/.env.example` as a reference. Add your own environment variables and keep credentials private.

Start the backend using the command defined in `server/package.json`.

### 3. Set up the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown by Vite.

## 🔒 Security

- Never commit `.env` files.
- Never publish database passwords or JWT secrets.
- Validate and authorize protected backend routes.

## 👩‍💻 Author

**Saumya Das**

GitHub: [saumyadas2203](https://github.com/saumyadas2203)

---

⭐ If you like this project, consider giving it a star!