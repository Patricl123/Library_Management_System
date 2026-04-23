const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Book = require("../models/Book");
const Borrow = require("../models/Borrow");

dotenv.config();

const books = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A practical guide to writing readable, maintainable software.",
    category: "Programming",
    available: true
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "An accessible book about building good habits and breaking bad ones.",
    category: "Self Help",
    available: true
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    description: "A modern classic about dreams, destiny, and persistence.",
    category: "Fiction",
    available: true
  }
];

const seedData = async () => {
  try {
    await connectDB();

    await Borrow.deleteMany();
    await User.deleteMany();
    await Book.deleteMany();

    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "admin123",
      role: "admin"
    });

    const normalUser = await User.create({
      name: "Library User",
      email: "user@example.com",
      password: "user123",
      role: "user"
    });

    await Book.insertMany(books);

    console.log("Seed data inserted successfully.");
    console.log(`Admin login: ${admin.email} / admin123`);
    console.log(`User login: ${normalUser.email} / user123`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`Seed error: ${error.message}`);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedData();
