const express = require("express");
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  addReview
} = require("../controllers/bookController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getBooks).post(protect, authorize("admin"), createBook);
router.route("/:id").get(getBookById).put(protect, authorize("admin"), updateBook).delete(protect, authorize("admin"), deleteBook);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
