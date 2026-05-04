import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "./models/User.js";

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB connected"));

const createAdmin = async () => {
  const existing = await User.findOne({ email: "admin@naac.com" });

  if (existing) {
    console.log("Admin already exists");
    process.exit();
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await User.create({
    name: "Admin",
    email: "admin@naac.com",
    password: hashedPassword,
    role: "hod",
    department: "Admin",
    profileCompleted: true,
  });

  console.log("Admin created");
  process.exit();
};

createAdmin();
