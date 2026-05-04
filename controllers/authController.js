import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const buildAuthResponse = (user) => ({
  token: jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  ),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    subjectsTaught: user.subjectsTaught,
    profileCompleted: user.profileCompleted,
  },
});

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department = "",
      subjectsTaught = [],
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      subjectsTaught,
      profileCompleted: Boolean(name && department),
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    res.json(buildAuthResponse(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department = "", subjectsTaught = [] } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        department,
        subjectsTaught,
        profileCompleted: Boolean(name && department),
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
