const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOptionIndex: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const submissionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: { type: [answerSchema], required: true },
    score: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// NFR-06: a submission is never re-editable once created — enforced by
// only ever using create(), never findByIdAndUpdate(), on this model.

module.exports = mongoose.model("Submission", submissionSchema);