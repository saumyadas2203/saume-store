import express from "express";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Your cart is empty" });
  }

  const requiredFields = [
    "fullName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
  ];

  if (
    !shippingAddress ||
    requiredFields.some(
      (field) =>
        typeof shippingAddress[field] !== "string" ||
        !shippingAddress[field].trim()
    )
  ) {
    return res.status(400).json({
      message: "Please provide all delivery address details",
    });
  }

  const quantities = new Map();

  for (const item of items) {
    if (
      !item.product ||
      !mongoose.isValidObjectId(item.product) ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1
    ) {
      return res.status(400).json({ message: "Invalid cart item" });
    }

    const id = String(item.product);
    quantities.set(id, (quantities.get(id) || 0) + item.quantity);
  }

  const session = await mongoose.startSession();

  try {
    let savedOrder;

    await session.withTransaction(async () => {
      const orderItems = [];
      let totalAmount = 0;

      for (const [id, quantity] of quantities) {
        const product = await Product.findOneAndUpdate(
          { _id: id, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );

        if (!product) {
          throw new Error(
            "A product is unavailable or has insufficient stock. Please refresh your cart."
          );
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        });

        totalAmount += product.price * quantity;
      }

      const created = await Order.create(
        [
          {
            user: req.user._id,
            items: orderItems,
            shippingAddress: {
              fullName: shippingAddress.fullName.trim(),
              phone: shippingAddress.phone.trim(),
              address: shippingAddress.address.trim(),
              city: shippingAddress.city.trim(),
              state: shippingAddress.state.trim(),
              pincode: shippingAddress.pincode.trim(),
            },
            totalAmount,
            paymentMethod: "COD",
            paymentStatus: "Pending",
            orderStatus: "Placed",
          },
        ],
        { session }
      );

      savedOrder = created[0];
    });

    res.status(201).json({
      message: "Cash on Delivery order placed successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Place order error:", error);

    res.status(400).json({
      message: error.message || "Could not place your order",
    });
  } finally {
    await session.endSession();
  }
});

export default router;
