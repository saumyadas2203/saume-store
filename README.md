# SAUMÉ Store 🛍️

A full-stack e-commerce web application built using the MERN stack, featuring a modern shopping experience, user authentication, product browsing, wishlist functionality, and an admin dashboard.

## ✨ Features

- 🔐 User registration and login
- 🛍️ Product browsing and shopping interface
- ❤️ Wishlist functionality
- 🛠️ Admin dashboard for product management
- 🔑 Authentication and protected routes
- 📱 Responsive user interface

## 🧰 Tech Stack

**Frontend**
- React
- Vite
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)

## 📁 Project Structure

```text
mini-mern-ecommerce/
├── client/          # React frontend
├── server/          # Express backend
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

- Node.js and npm
- MongoDB database
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/saume-store.git
cd saume-store
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder using `.env.example` as a reference. Add your own MongoDB connection string, JWT secret, and other required environment variables.

### 3. Start the backend

```bash
npm start
```

Use the start command defined in `server/package.json` if it differs.

### 4. Configure the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## 🔒 Environment Variables

Keep all credentials and secrets in environment files. Never commit `.env` files or expose database passwords and JWT secrets publicly.

## 🚀 Future Improvements

- Online payment integration
- Order management and order history
- Enhanced product search and filtering
- Deployment to a live hosting platform

## 👩‍💻 Author

**YOUR NAME**

GitHub: https://github.com/YOUR_GITHUB_USERNAME

---

⭐ If you find this project interesting, consider giving it a star!
