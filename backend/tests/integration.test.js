/**
 * Integration Tests: Top-Down Flow
 * Syllabus Lab 5: "Implement top-down integration testing"
 *
 * Flow: Login → Exam → Question → Submission → Result → DB
 * IT-01: Auth ↔ DB — login produces valid token
 * IT-02: Auth middleware ↔ Exam — token authorises exam creation
 * IT-03: Exam ↔ Question — question linked to exam
 * IT-04: Auth ↔ Exam listing — student sees available exams
 * IT-05: Exam ↔ Submission ↔ calculateResult() — submit triggers scoring
 * IT-06: Submission ↔ DB — stored result is retrievable
 * IT-07: Auth middleware ↔ RBAC — student blocked from admin routes
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/server");
const User     = require("../src/models/User");
const Exam     = require("../src/models/Exam");
const Question = require("../src/models/Question");
const Submission = require("../src/models/Submission");
const { hashPassword } = require("../src/utils/authUtils");

let adminToken, studentToken;
let createdExamId, createdQuestionId;

const ADMIN   = { name: "IT Admin",   email: "it_admin@example.com",   password: "AdminPass1",   role: "admin"   };
const STUDENT = { name: "IT Student", email: "it_student@example.com", password: "StudentPass1", role: "student" };

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  await User.deleteMany({ email: { $in: [ADMIN.email, STUDENT.email] } });
  const [ah, sh] = await Promise.all([
    hashPassword(ADMIN.password),
    hashPassword(STUDENT.password),
  ]);
  await User.create([{ ...ADMIN, password: ah }, { ...STUDENT, password: sh }]);
});

afterAll(async () => {
  await User.deleteMany({ email: { $in: [ADMIN.email, STUDENT.email] } });
  if (createdExamId) {
    await Submission.deleteMany({ exam: createdExamId });
    await Question.deleteMany({ exam: createdExamId });
    await Exam.findByIdAndDelete(createdExamId);
  }
  await mongoose.connection.close();
});

// ── IT-01 ─────────────────────────────────────────────────────────────────────
describe("IT-01: Auth module ↔ DB — login produces valid token", () => {
  test("admin login → 200 + token", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: ADMIN.email, password: ADMIN.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    adminToken = res.body.token;
  });

  test("student login → 200 + token", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: STUDENT.email, password: STUDENT.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    studentToken = res.body.token;
  });
});

// ── IT-02 ─────────────────────────────────────────────────────────────────────
describe("IT-02: Auth middleware ↔ Exam module — token authorises exam creation", () => {
  test("admin token → POST /api/exams → 201", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Integration Test Exam", durationMinutes: 30, totalMarks: 20 });
    expect(res.statusCode).toBe(201);
    expect(res.body.exam).toHaveProperty("_id");
    createdExamId = res.body.exam._id;
  });

  test("no token → POST /api/exams → 401", async () => {
    const res = await request(app).post("/api/exams")
      .send({ title: "No Auth Exam", durationMinutes: 30, totalMarks: 20 });
    expect(res.statusCode).toBe(401);
  });
});

// ── IT-03 ─────────────────────────────────────────────────────────────────────
describe("IT-03: Exam module ↔ Question module — question linked to exam", () => {
  test("admin adds question to exam → 201, question.exam matches examId", async () => {
    const res = await request(app).post("/api/questions")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        exam: createdExamId,
        questionText: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 1,
        marks: 10,
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.question.exam).toBe(createdExamId);
    createdQuestionId = res.body.question._id;
  });
});

// ── IT-04 ─────────────────────────────────────────────────────────────────────
describe("IT-04: Auth ↔ Exam listing — student sees available exams", () => {
  test("student token → GET /api/exams → list contains created exam", async () => {
    const res = await request(app).get("/api/exams")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    const ids = res.body.exams.map((e) => e._id);
    expect(ids).toContain(createdExamId);
    expect(res.body.exams.find((exam) => exam._id === createdExamId).hasSubmitted).toBe(false);
  });
});

// ── IT-05 ─────────────────────────────────────────────────────────────────────
describe("IT-05: Exam ↔ Submission ↔ calculateResult() — submit triggers scoring", () => {
  test("student submits correct answer → score=10 stored in submission", async () => {
    const res = await request(app).post("/api/submissions")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        exam: createdExamId,
        answers: [{ question: createdQuestionId, selectedOptionIndex: 1 }],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.submission.score).toBe(10);
    expect(res.body.submission.totalMarks).toBe(10);
  });
});

// ── IT-06 ─────────────────────────────────────────────────────────────────────
describe("IT-06: Submission ↔ DB — stored result is retrievable", () => {
  test("student retrieves result via GET /api/submissions/my/:examId", async () => {
    const res = await request(app).get(`/api/submissions/my/${createdExamId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.submission.score).toBe(10);
  });

  test("student exam list marks a completed exam so it cannot be retaken", async () => {
    const res = await request(app).get("/api/exams")
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.exams.find((exam) => exam._id === createdExamId).hasSubmitted).toBe(true);
  });

  test("admin can view student scores for an exam", async () => {
    const res = await request(app).get(`/api/submissions/exam/${createdExamId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.submissions).toEqual(expect.arrayContaining([
      expect.objectContaining({
        score: 10,
        totalMarks: 10,
        student: expect.objectContaining({ name: STUDENT.name }),
      }),
    ]));
  });

  test("completion status belongs to the signed-in user", async () => {
    const res = await request(app).get("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.exams.find((exam) => exam._id === createdExamId).hasSubmitted).toBe(false);
  });
});

// ── IT-07 ─────────────────────────────────────────────────────────────────────
describe("IT-07: Auth middleware ↔ RBAC — student blocked from admin routes", () => {
  test("student token → POST /api/exams → 403 Forbidden", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({ title: "Forbidden Exam", durationMinutes: 30, totalMarks: 20 });
    expect(res.statusCode).toBe(403);
  });

  test("student token → DELETE /api/questions/:id → 403 Forbidden", async () => {
    const res = await request(app).delete(`/api/questions/${createdQuestionId}`)
      .set("Authorization", `Bearer ${studentToken}`);
    expect(res.statusCode).toBe(403);
  });
});
