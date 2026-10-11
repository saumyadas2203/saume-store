

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import productRoutes from "./src/routes/productRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import wishlistRoutes from "./src/routes/wishlistRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

dotenv.config();

const app = express();


app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://saume-store.vercel.app",
    "https://saume-store-i5wwq2nha-saumyadas2203-1567.vercel.app"
  ]
}));

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Mini Store API is running" });
});

app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mini_mern_store";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });

