require("dotenv").config();

const mongoose = require("mongoose");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const User = require("../models/User");

const demoExams = [
  {
    title: "Software Testing Fundamentals",
    durationMinutes: 20,
    totalMarks: 10,
    questions: [
      {
        questionText: "What is the main purpose of software testing?",
        options: [
          "To prove software has no defects",
          "To find defects and evaluate quality",
          "To replace software requirements",
          "To guarantee future changes are unnecessary",
        ],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        questionText: "Which testing level focuses on individual functions or components?",
        options: ["System testing", "Acceptance testing", "Unit testing", "Exploratory testing"],
        correctOptionIndex: 2,
        marks: 2,
      },
      {
        questionText: "In boundary value analysis, which values are commonly tested?",
        options: [
          "Only values in the middle of the range",
          "Values at and just around the range limits",
          "Only invalid text values",
          "Random values with no range limits",
        ],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        questionText: "What does a regression test check?",
        options: [
          "Whether a change has broken existing behavior",
          "Whether the application has a new logo",
          "Whether source code has comments",
          "Whether a database has been backed up",
        ],
        correctOptionIndex: 0,
        marks: 2,
      },
      {
        questionText: "Which document describes the scope, approach, and schedule of testing?",
        options: ["Test plan", "User profile", "Build script", "Database schema"],
        correctOptionIndex: 0,
        marks: 2,
      },
    ],
  },
  {
    title: "Web Application Testing",
    durationMinutes: 25,
    totalMarks: 10,
    questions: [
      {
        questionText: "What does HTTP status code 401 generally indicate?",
        options: ["The request succeeded", "Authentication is required or invalid", "The server moved permanently", "The resource was created"],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        questionText: "Where should a bearer access token normally be sent in an API request?",
        options: ["In the Authorization header", "In the page title", "In a CSS class", "In the response status text"],
        correctOptionIndex: 0,
        marks: 2,
      },
      {
        questionText: "What is the purpose of role-based access control?",
        options: [
          "To change the screen color by user",
          "To restrict actions according to a user's role",
          "To store passwords in browser history",
          "To skip server-side validation",
        ],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        questionText: "Why should an exam API avoid returning the correct answer to students?",
        options: [
          "It makes the page load more slowly",
          "It prevents students from seeing the answer before submission",
          "It removes the need for authentication",
          "It increases the exam duration",
        ],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        questionText: "What should happen when a student submits the same exam twice?",
        options: [
          "The second submission silently overwrites the first",
          "The system accepts both without checking",
          "The system rejects the duplicate submission",
          "The student is automatically made an admin",
        ],
        correctOptionIndex: 2,
        marks: 2,
      },
    ],
  },
];

async function seedDemoData() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required. Configure backend/.env before seeding.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) {
    throw new Error(
      "No admin account exists. Promote a trusted account to admin, then run this command again."
    );
  }

  let questionCount = 0;
  for (const demoExam of demoExams) {
    const exam = await Exam.findOneAndUpdate(
      { title: demoExam.title, createdBy: admin._id },
      {
        $set: {
          durationMinutes: demoExam.durationMinutes,
          totalMarks: demoExam.totalMarks,
        },
        $setOnInsert: { title: demoExam.title, createdBy: admin._id },
      },
      { new: true, upsert: true, runValidators: true }
    );

    for (const questionData of demoExam.questions) {
      await Question.findOneAndUpdate(
        { exam: exam._id, questionText: questionData.questionText },
        {
          $set: {
            options: questionData.options,
            correctOptionIndex: questionData.correctOptionIndex,
            marks: questionData.marks,
          },
          $setOnInsert: {
            exam: exam._id,
            questionText: questionData.questionText,
          },
        },
        { new: true, upsert: true, runValidators: true }
      );
      questionCount += 1;
    }
  }

  console.log(`Demo data is ready: ${demoExams.length} exams and ${questionCount} questions.`);
}

seedDemoData()
  .catch((error) => {
    console.error("Could not seed demo data:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
