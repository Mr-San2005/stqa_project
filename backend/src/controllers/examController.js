const Exam = require("../models/Exam");

// FR-12: create exam (admin only)
async function createExam(req, res) {
  try {
    const { title, durationMinutes, totalMarks } = req.body;

    if (!title || !durationMinutes || !totalMarks) {
      return res.status(400).json({ message: "Title, duration, and total marks are required" });
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

// FR-18 / FR-03: list all exams (admin sees all, student sees all too for now — simple scope)
async function getExams(req, res) {
  try {
    const exams = await Exam.find().select("title durationMinutes totalMarks createdAt");
    res.json({ exams });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// FR-04: get single exam details (instructions view)
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

module.exports = { createExam, getExams, getExamById };