import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./src/models/Product.js";

dotenv.config();

const newProducts = [
{ name: "Classic Sunglasses", description: "Stylish sunglasses for sunny days.", price: 799, category: "Fashion", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80", rating: 4.5, stock: 15 },
{ name: "Leather Handbag", description: "An elegant handbag for everyday outings.", price: 1799, category: "Fashion", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80", rating: 4.6, stock: 10 },
{ name: "Running Shoes", description: "Comfortable shoes for walks and workouts.", price: 2199, category: "Fashion", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80", rating: 4.4, stock: 16 },
{ name: "Bluetooth Speaker", description: "Portable speaker for music anywhere.", price: 1499, category: "Electronics", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80", rating: 4.5, stock: 11 },
{ name: "Mechanical Keyboard", description: "A stylish keyboard for work and gaming.", price: 2899, category: "Electronics", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", rating: 4.7, stock: 8 },
{ name: "Wireless Mouse", description: "A compact mouse for everyday productivity.", price: 699, category: "Electronics", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80", rating: 4.3, stock: 22 },
{ name: "Ceramic Coffee Mug", description: "A simple ceramic mug for coffee breaks.", price: 349, category: "Home", image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80", rating: 4.4, stock: 25 },
{ name: "Decorative Plant", description: "Greenery to brighten your room.", price: 599, category: "Home", image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=900&q=80", rating: 4.5, stock: 17 },
{ name: "Soft Cushion", description: "A cozy cushion for your sofa or bed.", price: 449, category: "Home", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80", rating: 4.2, stock: 19 },
{ name: "Travel Duffel Bag", description: "A spacious bag for weekend trips.", price: 1599, category: "Accessories", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", rating: 4.6, stock: 13 },
{ name: "Minimalist Wallet", description: "A compact wallet for cards and cash.", price: 549, category: "Accessories", image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", rating: 4.3, stock: 21 },
{ name: "Desk Organizer", description: "Keep stationery and desk essentials organized.", price: 399, category: "Home", image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?auto=format&fit=crop&w=900&q=80", rating: 4.4, stock: 14 }
];

try {
await dotenv.config();
await mongoose.connect(process.env.MONGO_URI);

const existingNames = new Set(
(await Product.find({}, { name: 1 })).map(product => product.name)
);

const productsToAdd = newProducts.filter(
product => !existingNames.has(product.name)
);

if (productsToAdd.length > 0) {
await Product.insertMany(productsToAdd);
}

console.log(`Added ${productsToAdd.length} new products.`);
console.log(`Total products in database: ${await Product.countDocuments()}`);
} catch (error) {
console.error("Error:", error.message);
} finally {
await mongoose.disconnect();
}
