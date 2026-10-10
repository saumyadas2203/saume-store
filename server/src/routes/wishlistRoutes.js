import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("wishlist");
    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: "Unable to load wishlist" });
  }
});

router.post("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { wishlist: product._id },
    });

    res.json({ message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Unable to update wishlist" });
  }
});

router.delete("/:productId", async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { wishlist: productId },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ message: "Unable to update wishlist" });
  }
});

export default router;
