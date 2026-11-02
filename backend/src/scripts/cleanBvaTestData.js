require("dotenv").config();

const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const Submission = require("../models/Submission");

const testExamTitles = ["BVA Test Exam", "BVA Marks Exam"];

async function cleanBvaTestData() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Configure backend/.env before cleanup.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const exams = await Exam.find({ title: { $in: testExamTitles } }).select("_id");
  const examIds = exams.map((exam) => exam._id);

  if (examIds.length === 0) {
    console.log("No BVA test exams found.");
    return;
  }

  await Submission.deleteMany({ exam: { $in: examIds } });
  await Question.deleteMany({ exam: { $in: examIds } });
  const { deletedCount = 0 } = await Exam.deleteMany({ _id: { $in: examIds } });

  console.log(`Removed ${deletedCount} BVA test exam(s) and their related questions and submissions.`);
}

cleanBvaTestData()
  .catch((error) => {
    console.error("Could not clean BVA test data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
