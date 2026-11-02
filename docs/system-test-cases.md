# System Test Cases — Online Examination System
**Document:** STC-OES-01 | **Technique:** System Testing (Black-Box, end-to-end)
**Lab Ref:** BIS702 Lab 6 — "Apply all testing phases to Student Result System"
**Tester:** Sanjay | **Environment:** Backend running on localhost:5000, MongoDB Atlas

System testing validates the **complete integrated system** against the original
requirements from a user's perspective. Each test case below represents a full
user workflow, not an isolated API call.

---

## Pre-conditions for All System Tests
1. Backend server is running: `cd backend && npm run dev`
2. MongoDB Atlas is connected (check console: "MongoDB connected")
3. No leftover test data from previous runs (or use fresh test credentials)

---

## ST-01: Student Registration and Login Flow
**Requirement:** FR-01, FR-02
**Type:** Positive end-to-end

| Step | Action | Expected Result |
|---|---|---|
| 1 | POST /api/auth/register with name, email, password, age=25 | 201, "User registered successfully" |
| 2 | POST /api/auth/login with same email and password | 200, token returned, role="student" |
| 3 | Decode JWT token | Contains id and role="student" |
| 4 | Use token on GET /api/exams | 200, exam list returned |

**Pass Criteria:** All 4 steps return expected results.
**Actual Result:** _(fill after manual run)_
**Status:** _(Pass/Fail)_

---

## ST-02: Admin Creates Exam and Adds Questions
**Requirement:** FR-11, FR-12, FR-13, FR-16, FR-17
**Type:** Positive end-to-end (admin workflow)

| Step | Action | Expected Result |
|---|---|---|
| 1 | POST /api/auth/login with admin credentials | 200, token with role="admin" |
| 2 | POST /api/exams with title, durationMinutes=60, totalMarks=20 | 201, exam object with _id |
| 3 | POST /api/questions with exam=<id>, questionText, 4 options, correctOptionIndex=1, marks=10 | 201, question linked to exam |
| 4 | POST /api/questions (second question, marks=10) | 201, second question linked |
| 5 | GET /api/exams/:id | 200, exam details returned |

**Pass Criteria:** All 5 steps succeed, exam has 2 questions in DB.
**Actual Result:** _(fill after manual run)_
**Status:** _(Pass/Fail)_

---

## ST-03: Student Takes Exam and Gets Result
**Requirement:** FR-03, FR-04, FR-05, FR-06, FR-07, FR-08, FR-09, FR-10
**Type:** Positive end-to-end (core student workflow)
**Pre-condition:** ST-02 completed — exam with 2 questions exists

| Step | Action | Expected Result |
|---|---|---|
| 1 | Student logs in (from ST-01) | 200, studentToken |
| 2 | GET /api/exams | 200, list includes the exam from ST-02 |
| 3 | GET /api/exams/:id | 200, exam instructions (title, duration, totalMarks) |
| 4 | GET /api/questions/exam/:examId | 200, questions WITHOUT correctOptionIndex (stripped server-side) |
| 5 | POST /api/submissions with exam=<id>, answers=[{question:q1, selectedOptionIndex:1}, {question:q2, selectedOptionIndex:0}] | 201, score=10, totalMarks=20 |
| 6 | GET /api/submissions/my/:examId | 200, submission with score=10 |

**Pass Criteria:** Score is correctly calculated (1 correct × 10 marks = 10/20).
**Actual Result:** _(fill after manual run)_
**Status:** _(Pass/Fail)_

---

## ST-04: Role-Based Access Control Enforcement
**Requirement:** NFR-03
**Type:** Negative / Security

| Step | Action | Expected Result |
|---|---|---|
| 1 | Student logs in, gets studentToken | 200 |
| 2 | POST /api/exams with studentToken | 403, "Admin access required" |
| 3 | DELETE /api/questions/:id with studentToken | 403, "Admin access required" |
| 4 | GET /api/exams with NO token | 401, "No token provided" |
| 5 | GET /api/exams with tampered/invalid token | 401, "Invalid or expired token" |

**Pass Criteria:** All 5 steps return the expected rejection codes.
**Actual Result:** _(fill after manual run)_
**Status:** _(Pass/Fail)_

---

## ST-05: Duplicate Submission Prevention
**Requirement:** NFR-06
**Type:** Negative / Data Integrity
**Pre-condition:** ST-03 completed — student has already submitted the exam

| Step | Action | Expected Result |
|---|---|---|
| 1 | Student logs in again | 200, token |
| 2 | POST /api/submissions with same examId again | 409, "Exam already submitted" |

**Pass Criteria:** Second submission is rejected with 409.
**Actual Result:** _(fill after manual run)_
**Status:** _(Pass/Fail)_

---

## System Test Summary (fill after running all 5)

| TC ID | Description | Status | Defect |
|---|---|---|---|
| ST-01 | Student registration + login | _(run)_ | — |
| ST-02 | Admin creates exam + questions | _(run)_ | — |
| ST-03 | Student takes exam + gets result | _(run)_ | — |
| ST-04 | RBAC enforcement | _(run)_ | — |
| ST-05 | Duplicate submission prevention | _(run)_ | — |

**Evidence to capture:** Use Postman to execute each step and screenshot the
responses. Save as `evidence/system-test-ST-0X.png` for each test case.
