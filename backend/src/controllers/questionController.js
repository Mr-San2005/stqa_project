const Question = require("../models/Question");

// FR-13: add question (admin only)
async function addQuestion(req, res) {
  try {
    const { exam, questionText, options, correctOptionIndex, marks } = req.body;

    if (!exam || !questionText || !options || correctOptionIndex === undefined || !marks) {
      return res.status(400).json({ message: "All question fields are required" });
    }

    const question = await Question.create({
      exam,
      questionText,
      options,
      correctOptionIndex,
      marks,
    });

    res.status(201).json({ message: "Question added", question });
  } catch (err) {
    res.status(400).json({ message: "Validation error", error: err.message });
  }
}

// FR-14: edit question (admin only)
async function updateQuestion(req, res) {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question updated", question });
  } catch (err) {
    res.status(400).json({ message: "Validation error", error: err.message });
  }
}

// FR-15: delete question (admin only)
async function deleteQuestion(req, res) {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

// Used by student exam-taking screen — strips correct answer from response
async function getQuestionsByExam(req, res) {
  try {
    const questions = await Question.find({ exam: req.params.examId }).select(
      "questionText options marks"
    );
    res.json({ questions });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
}

module.exports = { addQuestion, updateQuestion, deleteQuestion, getQuestionsByExam };