const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    totalMarks: { type: Number, required: true, min: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);