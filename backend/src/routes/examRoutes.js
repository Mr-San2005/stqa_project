const express = require("express");
const router = express.Router();
const { createExam, getExams, getExamById } = require("../controllers/examController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, requireAdmin, createExam);
router.get("/", verifyToken, getExams);
router.get("/:id", verifyToken, getExamById);

module.exports = router;