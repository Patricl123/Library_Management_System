const mongoose = require("mongoose");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const asyncHandler = require("../utils/asyncHandler");

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

const getUserById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid user ID.");
  }

  const user = await User.findById(req.params.id).select("-password");

  if (!user) {
    res.status(404);
    throw new Error("User not found.");
  }

  const borrowSummary = await Borrow.find({ user: user._id }).populate("book", "title author");

  res.json({
    success: true,
    data: {
      user,
      borrowSummary
    }
  });
});

module.exports = {
  getUsers,
  getUserById
};
