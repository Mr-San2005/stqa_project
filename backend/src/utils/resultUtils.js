/**
 * Pure function — no DB, no HTTP. Takes the exam's questions (with correct
 * answers) and the student's submitted answers, returns the score.
 *
 * questions: [{ _id, correctOptionIndex, marks }]
 * studentAnswers: [{ question, selectedOptionIndex }]
 *
 * This is deliberately isolated so it can be unit-tested exhaustively and
 * used later for statement/branch coverage analysis (Stage 8).
 */
function calculateResult(questions, studentAnswers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { score: 0, totalMarks: 0 };
  }

  let score = 0;
  let totalMarks = 0;

  for (const question of questions) {
    totalMarks += question.marks;

    const studentAnswer = studentAnswers.find(
      (a) => a.question.toString() === question._id.toString()
    );

    if (!studentAnswer) {
      // Unanswered question — no marks awarded, no penalty
      continue;
    }

    if (studentAnswer.selectedOptionIndex === question.correctOptionIndex) {
      score += question.marks;
    }
    // else: wrong answer, no marks — no negative marking in this system
  }

  return { score, totalMarks };
}

module.exports = { calculateResult };