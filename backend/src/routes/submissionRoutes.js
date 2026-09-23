const express = require("express");
const router = express.Router();
const { submitExam, getMyResult, getExamResults } = require("../controllers/submissionController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

router.post("/", verifyToken, submitExam);
router.get("/my/:examId", verifyToken, getMyResult);
router.get("/exam/:examId", verifyToken, requireAdmin, getExamResults);

module.exports = router;