/**
 * Black-Box Tests: Equivalence Partitioning + Boundary Value Analysis
 * Covers: POST /api/auth/login  (TC-BB-01 to TC-BB-08)
 *         POST /api/exams       (TC-BB-09 to TC-BB-17)
 *
 * DEF-001 is seeded in examController.js (off-by-one on durationMinutes
 * upper bound). TC-BB-09 will FAIL on first run, proving the defect exists.
 * After the fix (>= changed to >), all 16 tests pass.
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/server");
const User     = require("../src/models/User");
const Exam     = require("../src/models/Exam");
const Question = require("../src/models/Question");
const Submission = require("../src/models/Submission");
const { hashPassword } = require("../src/utils/authUtils");

const TEST_USER = {
  name: "BB Test User",
  email: "bbtest@example.com",
  password: "ValidPass123",
  role: "admin",
};

const BVA_EXAM_TITLES = ["BVA Test Exam", "BVA Marks Exam"];

let adminToken;

async function cleanBvaExamFixtures() {
  const exams = await Exam.find({ title: { $in: BVA_EXAM_TITLES } }).select("_id");
  const examIds = exams.map((exam) => exam._id);
  if (examIds.length === 0) return;

  await Submission.deleteMany({ exam: { $in: examIds } });
  await Question.deleteMany({ exam: { $in: examIds } });
  await Exam.deleteMany({ _id: { $in: examIds } });
}

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  await cleanBvaExamFixtures();
  await User.deleteOne({ email: TEST_USER.email });
  const hashed = await hashPassword(TEST_USER.password);
  await User.create({ ...TEST_USER, password: hashed });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: TEST_USER.email, password: TEST_USER.password });
  adminToken = res.body.token;
});

afterAll(async () => {
  await cleanBvaExamFixtures();
  await User.deleteOne({ email: TEST_USER.email });
  await mongoose.connection.close();
});

// ── EP: Login — email field ───────────────────────────────────────────────────
describe("EP — Login: email field partitions", () => {
  test("TC-BB-01: valid email format is accepted and processed", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect([200, 401]).toContain(res.statusCode);
  });

  test("TC-BB-02: empty email string returns 400", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: "", password: "SomePass1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("TC-BB-03: missing email field returns 400", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ password: "SomePass1" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });
});

// ── EP: Login — password field ────────────────────────────────────────────────
describe("EP — Login: password field partitions", () => {
  test("TC-BB-05: valid password is accepted and processed", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect([200, 401]).toContain(res.statusCode);
  });

  test("TC-BB-06: empty password string returns 400", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: TEST_USER.email, password: "" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  test("TC-BB-07: correct credentials return 200 with token", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.role).toBe("admin");
  });

  test("TC-BB-08: wrong password returns 401", async () => {
    const res = await request(app).post("/api/auth/login")
      .send({ email: TEST_USER.email, password: "WrongPassword999" });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/invalid credentials/i);
  });
});

// ── BVA: durationMinutes (valid: 1–300) ───────────────────────────────────────
describe("BVA — durationMinutes boundaries (valid: 1–300)", () => {
  const base = { title: "BVA Test Exam", totalMarks: 100 };

  test("TC-BB-09: durationMinutes=300 (upper boundary) should be accepted", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, durationMinutes: 300 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-BB-10: durationMinutes=301 (above upper) should be rejected", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, durationMinutes: 301 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/duration/i);
  });

  test("TC-BB-11: durationMinutes=1 (lower boundary) should be accepted", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, durationMinutes: 1 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-BB-12: durationMinutes=0 (below lower) should be rejected", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, durationMinutes: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/duration/i);
  });

  test("TC-BB-13: durationMinutes=150 (nominal) should be accepted", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, durationMinutes: 150 });
    expect(res.statusCode).toBe(201);
  });
});

// ── BVA: totalMarks (valid: 1–500) ────────────────────────────────────────────
describe("BVA — totalMarks boundaries (valid: 1–500)", () => {
  const base = { title: "BVA Marks Exam", durationMinutes: 60 };

  test("TC-BB-14: totalMarks=500 (upper boundary) should be accepted", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, totalMarks: 500 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-BB-15: totalMarks=501 (above upper) should be rejected", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, totalMarks: 501 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/marks/i);
  });

  test("TC-BB-16: totalMarks=1 (lower boundary) should be accepted", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, totalMarks: 1 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-BB-17: totalMarks=0 (below lower) should be rejected", async () => {
    const res = await request(app).post("/api/exams")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ ...base, totalMarks: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/marks/i);
  });
});
