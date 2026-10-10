
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);


import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const email = process.argv[2]?.trim().toLowerCase();

if (!email) {
  console.error(
    'Usage: node src/scripts/makeAdmin.js "your-email@example.com"'
  );
  process.exit(1);
}

const makeAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({ email });

    if (!user) {
      console.error(
        "User not found. First create an account on your website."
      );
      return;
    }

    user.role = "admin";
    await user.save();

    console.log(`Admin role assigned to: ${user.email}`);
  } catch (error) {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

makeAdmin();
