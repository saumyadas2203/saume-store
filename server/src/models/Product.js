import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5, min: 0, max: 5 },
  stock: { type: Number, default: 10, min: 0 }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
