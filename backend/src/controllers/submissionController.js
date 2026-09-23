const Submission = require("../models/Submission");
const Question = require("../models/Question");
const { calculateResult } = require("../utils/resultUtils");

// FR-08 / FR-09: submit exam and auto-calculate result
async function submitExam(req, res) {
  try {
    const { exam, answers } = req.body;

    if (!exam || !Array.isArray(answers)) {
      return res.status(400).json({ message: "Exam and answers are required" });
    }

    // NFR-06: prevent duplicate submissions for the same exam by the same student
    const existing = await Submission.findOne({ exam, student: req.user.id });
    if (existing) {
      return res.status(409).json({ message: "Exam already submitted" });
    }

    // Fetch full questions (with correct answers) server-side —
    // never trust correctness data sent from the client
    const questions = await Question.find({ exam });

    const { score, totalMarks } = calculateResult(questions, answers);

    const submission = await Submission.create({
      exam,
      student: req.user.id,
      answers,
      score,
      totalMarks,
    });

    res.status(201).json({ message: "Exam submitted", submission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// FR-10: student views their own result
async function getMyResult(req, res) {
  try {
    const submission = await Submission.findOne({
      exam: req.params.examId,
      student: req.user.id,
    });
    if (!submission) {
      return res.status(404).json({ message: "No submission found for this exam" });
    }
    res.json({ submission });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// FR-19: admin views all results for an exam
async function getExamResults(req, res) {
  try {
    const submissions = await Submission.find({ exam: req.params.examId }).populate(
      "student",
      "name email"
    );
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { submitExam, getMyResult, getExamResults };