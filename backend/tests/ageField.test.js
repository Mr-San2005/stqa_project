/**
 * Black-Box Tests: EP + BVA — Age Field (register endpoint)
 * Syllabus Lab 3: "Design test cases for age field (18–60)"
 * Covers TC-AGE-01 through TC-AGE-09 + EP partitions EP-A1 to EP-A6.
 * DEF-002 (missing age validation) is already fixed in authController.js.
 */

const request  = require("supertest");
const mongoose = require("mongoose");
const app      = require("../src/server");
const User     = require("../src/models/User");

const BASE  = { name: "Age Test", password: "ValidPass1" };
const email = (suffix) => `agetest_${suffix}@example.com`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  });
  await User.deleteMany({ email: /^agetest_/ });
});

afterAll(async () => {
  await User.deleteMany({ email: /^agetest_/ });
  await mongoose.connection.close();
});

// ── EP: Age field partitions ──────────────────────────────────────────────────
describe("EP — Age field partitions", () => {
  test("EP-A1: age=30 (valid partition) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("ep_a1"), age: 30 });
    expect(res.statusCode).toBe(201);
  });

  test("EP-A2: age=15 (below valid) → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("ep_a2"), age: 15 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("EP-A3: age=70 (above valid) → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("ep_a3"), age: 70 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("EP-A5: age=-5 (negative) → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("ep_a5"), age: -5 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("EP-A6: age omitted (optional field) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("ep_a6") });
    expect(res.statusCode).toBe(201);
  });
});

// ── BVA: Age field boundaries (valid: 18–60) ──────────────────────────────────
describe("BVA — Age field boundaries (valid: 18–60)", () => {
  test("TC-AGE-01: age=18 (lower boundary) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_18"), age: 18 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-AGE-02: age=17 (just below lower) → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_17"), age: 17 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("TC-AGE-03: age=19 (just above lower) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_19"), age: 19 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-AGE-04: age=60 (upper boundary) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_60"), age: 60 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-AGE-05: age=61 (just above upper) → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_61"), age: 61 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("TC-AGE-06: age=59 (just below upper) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_59"), age: 59 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-AGE-07: age=30 (nominal) → 201", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_30"), age: 30 });
    expect(res.statusCode).toBe(201);
  });

  test("TC-AGE-08: age=0 → 400", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_0"), age: 0 });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/age/i);
  });

  test("TC-AGE-09: age omitted → 201 (optional field)", async () => {
    const res = await request(app).post("/api/auth/register")
      .send({ ...BASE, email: email("bva_none") });
    expect(res.statusCode).toBe(201);
  });
});
