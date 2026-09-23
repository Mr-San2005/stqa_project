const express = require("express");
const router = express.Router();
const {
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByExam,
} = require("../controllers/questionController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, requireAdmin, addQuestion);
router.put("/:id", verifyToken, requireAdmin, updateQuestion);
router.delete("/:id", verifyToken, requireAdmin, deleteQuestion);
router.get("/exam/:examId", verifyToken, getQuestionsByExam);

module.exports = router;