import express from "express";
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
} from "../controllers/authController.js";
import { auth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getCurrentUser);
router.put("/profile", auth, updateProfile);

export default router;
