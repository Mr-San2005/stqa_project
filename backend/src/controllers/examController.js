const Exam = require("../models/Exam");

// Validation constants — upper bounds defined here for BVA testing
const DURATION_MIN = 1;
const DURATION_MAX = 300;
const MARKS_MIN = 1;
const MARKS_MAX = 500;

// FR-12: create exam (admin only)
async function createExam(req, res) {
  try {
    const { title, durationMinutes, totalMarks } = req.body;

    if (!title || durationMinutes === undefined || totalMarks === undefined) {
      return res.status(400).json({ message: "Title, duration, and total marks are required" });
    }

    // DEF-001 (FIXED): was >= DURATION_MAX (off-by-one), corrected to > DURATION_MAX
    if (durationMinutes < DURATION_MIN || durationMinutes > DURATION_MAX) {
      return res.status(400).json({
        message: `Duration must be between ${DURATION_MIN} and ${DURATION_MAX} minutes`,
      });
    }

    if (totalMarks < MARKS_MIN || totalMarks > MARKS_MAX) {
      return res.status(400).json({
        message: `Total marks must be between ${MARKS_MIN} and ${MARKS_MAX}`,
      });
    }

    const exam = await Exam.create({
      title,
      durationMinutes,
      totalMarks,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Exam created", exam });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// FR-18 / FR-03: list all exams
async function getExams(req, res) {
  try {
    const exams = await Exam.find().select("title durationMinutes totalMarks createdAt");
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// FR-04: get single exam details
async function getExamById(req, res) {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { createExam, getExams, getExamById, DURATION_MIN, DURATION_MAX, MARKS_MIN, MARKS_MAX };
