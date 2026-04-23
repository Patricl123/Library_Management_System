const express = require("express");
const {
  requestBorrow,
  getMyBorrows,
  getAllBorrows,
  approveBorrow,
  rejectBorrow,
  returnBorrow
} = require("../controllers/borrowController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, requestBorrow);
router.get("/mine", protect, getMyBorrows);
router.get("/", protect, authorize("admin"), getAllBorrows);
router.patch("/:id/approve", protect, authorize("admin"), approveBorrow);
router.patch("/:id/reject", protect, authorize("admin"), rejectBorrow);
router.patch("/:id/return", protect, returnBorrow);

module.exports = router;
