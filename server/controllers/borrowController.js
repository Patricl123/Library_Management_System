const mongoose = require("mongoose");
const Borrow = require("../models/Borrow");
const Book = require("../models/Book");
const asyncHandler = require("../utils/asyncHandler");

const requestBorrow = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
    res.status(400);
    throw new Error("A valid book ID is required.");
  }

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }

  if (!book.available) {
    res.status(400);
    throw new Error("This book is currently unavailable.");
  }

  const existingRequest = await Borrow.findOne({
    user: req.user._id,
    book: bookId,
    status: { $in: ["pending", "approved"] }
  });

  if (existingRequest) {
    res.status(400);
    throw new Error("You already have an active request for this book.");
  }

  const borrow = await Borrow.create({
    user: req.user._id,
    book: bookId
  });

  const populatedBorrow = await borrow.populate("book", "title author category available");

  res.status(201).json({
    success: true,
    message: "Borrow request created successfully.",
    data: populatedBorrow
  });
});

const getMyBorrows = asyncHandler(async (req, res) => {
  const borrows = await Borrow.find({ user: req.user._id })
    .populate("book", "title author category available")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: borrows.length,
    data: borrows
  });
});

const getAllBorrows = asyncHandler(async (req, res) => {
  const borrows = await Borrow.find()
    .populate("user", "name email role")
    .populate("book", "title author category available")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: borrows.length,
    data: borrows
  });
});

const approveBorrow = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid borrow ID.");
  }

  const borrow = await Borrow.findById(req.params.id).populate("book");

  if (!borrow) {
    res.status(404);
    throw new Error("Borrow request not found.");
  }

  if (borrow.status !== "pending") {
    res.status(400);
    throw new Error("Only pending requests can be approved.");
  }

  if (!borrow.book.available) {
    res.status(400);
    throw new Error("This book is currently unavailable.");
  }

  borrow.status = "approved";
  borrow.borrowDate = new Date();
  borrow.book.available = false;

  await borrow.book.save();
  await borrow.save();
  await borrow.populate("user", "name email");

  res.json({
    success: true,
    message: "Borrow request approved.",
    data: borrow
  });
});

const rejectBorrow = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid borrow ID.");
  }

  const borrow = await Borrow.findById(req.params.id);

  if (!borrow) {
    res.status(404);
    throw new Error("Borrow request not found.");
  }

  if (borrow.status !== "pending") {
    res.status(400);
    throw new Error("Only pending requests can be rejected.");
  }

  borrow.status = "rejected";
  await borrow.save();

  res.json({
    success: true,
    message: "Borrow request rejected.",
    data: borrow
  });
});

const returnBorrow = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid borrow ID.");
  }

  const borrow = await Borrow.findById(req.params.id).populate("book");

  if (!borrow) {
    res.status(404);
    throw new Error("Borrow record not found.");
  }

  const isOwner = borrow.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    res.status(403);
    throw new Error("You can only return your own borrowed books.");
  }

  if (borrow.status !== "approved") {
    res.status(400);
    throw new Error("Only approved borrows can be returned.");
  }

  borrow.status = "returned";
  borrow.returnDate = new Date();
  borrow.book.available = true;

  await borrow.book.save();
  await borrow.save();
  await borrow.populate("user", "name email");

  res.json({
    success: true,
    message: "Book returned successfully.",
    data: borrow
  });
});

module.exports = {
  requestBorrow,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  rejectBorrow,
  returnBorrow
};
