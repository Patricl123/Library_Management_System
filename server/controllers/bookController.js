const mongoose = require("mongoose");
const Book = require("../models/Book");
const asyncHandler = require("../utils/asyncHandler");

const getBooks = asyncHandler(async (req, res) => {
  const { search = "", category = "" } = req.query;

  const filters = {};

  if (search) {
    filters.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } }
    ];
  }

  if (category) {
    filters.category = { $regex: `^${category}$`, $options: "i" };
  }

  const books = await Book.find(filters).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: books.length,
    data: books
  });
});

const getBookById = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid book ID.");
  }

  const book = await Book.findById(req.params.id).populate("reviews.user", "name email");

  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }

  res.json({
    success: true,
    data: book
  });
});

const createBook = asyncHandler(async (req, res) => {
  const { title, author, description, category, available } = req.body;

  if (!title || !author || !description || !category) {
    res.status(400);
    throw new Error("Title, author, description, and category are required.");
  }

  const book = await Book.create({
    title,
    author,
    description,
    category,
    available: available !== undefined ? available : true
  });

  res.status(201).json({
    success: true,
    message: "Book created successfully.",
    data: book
  });
});

const updateBook = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid book ID.");
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }

  const fields = ["title", "author", "description", "category", "available"];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      book[field] = req.body[field];
    }
  });

  const updatedBook = await book.save();

  res.json({
    success: true,
    message: "Book updated successfully.",
    data: updatedBook
  });
});

const deleteBook = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid book ID.");
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }

  await book.deleteOne();

  res.json({
    success: true,
    message: "Book deleted successfully."
  });
});

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid book ID.");
  }

  if (!rating || !comment) {
    res.status(400);
    throw new Error("Rating and comment are required.");
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error("Book not found.");
  }

  const existingReview = book.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    existingReview.rating = Number(rating);
    existingReview.comment = comment;
  } else {
    book.reviews.push({
      rating: Number(rating),
      comment,
      user: req.user._id
    });
  }

  await book.save();
  await book.populate("reviews.user", "name email");

  res.status(201).json({
    success: true,
    message: "Review saved successfully.",
    data: book
  });
});

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview
};
