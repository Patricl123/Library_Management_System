const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required.");
  }

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address.");
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error("Password must be at least 6 characters long.");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(400);
    throw new Error("An account with this email already exists.");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: "user"
  });

  res.status(201).json({
    success: true,
    message: "Registration successful.",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required.");
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password.");
  }

  res.json({
    success: true,
    message: "Login successful.",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    }
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser
};
