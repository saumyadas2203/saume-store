
import express from "express";
import Product from "../models/Product.js";
import authMiddleware, {
  adminMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all products with category filter
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category && category.toLowerCase() !== "all") {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i",
      };
    }

    const products = await Product.find(filter).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error("Fetch products error:", error);

    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// Get a single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
    });
  }
});

// Add product — admin only
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      rating,
      stock,
    } = req.body;

    if (!name || price === undefined || !category || !image) {
      return res.status(400).json({
        message: "Name, price, category and image are required",
      });
    }

    const product = await Product.create({
      name,
      description: description || "",
      price: Number(price),
      category,
      image,
      ...(rating !== undefined && {
        rating: Number(rating),
      }),
      ...(stock !== undefined && {
        stock: Number(stock),
      }),
    });

    res.status(201).json({
      message: "Product added successfully",
      product,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to add product",
    });
  }
});

export default router;
