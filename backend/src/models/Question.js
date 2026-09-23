const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    questionText: { type: String, required: true, trim: true },
    options: {
      type: [String],
      validate: {
        validator: (arr) => arr.length === 4,
        message: "A question must have exactly 4 options",
      },
      required: true,
    },
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    marks: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);