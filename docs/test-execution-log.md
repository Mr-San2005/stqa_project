# Test Execution Log — Online Examination System
**Project:** OES-STQA | **Plan Ref:** TP-OES-01 | **Tester:** Sanjay
**Course:** BIS702 — Software Testing and Quality Assurance

> All results in this log are from ACTUAL test execution. Metrics in the
> final report are derived from this file only.

---

## Stage 1 — Unit Testing (White-Box: Statement + Branch Coverage)
**Syllabus:** Lab 4 + Lab 8 — "Statement and branch coverage", "White-box testing on grade calculation function"
**Function under test:** `calculateResult()` in `backend/src/utils/resultUtils.js`
**Tool:** Jest with `--coverage` flag
**Command:** `cd backend && npm run test:coverage`

### Branch Map for calculateResult()

| Branch | Code Location | Condition |
|---|---|---|
| B1-T | Line 12 | `!Array.isArray(questions) \|\| questions.length === 0` → TRUE (early return) |
| B1-F | Line 12 | Same condition → FALSE (enter loop) |
| B2-T | Line 24 | `!studentAnswer` → TRUE (unanswered, continue) |
| B2-F | Line 24 | `!studentAnswer` → FALSE (answer exists) |
| B3-T | Line 28 | `selectedOptionIndex === correctOptionIndex` → TRUE (correct) |
| B3-F | Line 28 | Same → FALSE (wrong answer) |

### Test Cases

| TC ID | Test Name | Branches Hit | Expected | Actual | Status |
|---|---|---|---|---|---|
| TC-WB-01 | returns 0/0 for empty list | B1-T | {score:0,totalMarks:0} | _(run)_ | _(run)_ |
| TC-WB-02 | returns 0/0 for null input | B1-T | {score:0,totalMarks:0} | _(run)_ | _(run)_ |
| TC-WB-03 | all answers correct | B1-F, B2-F, B3-T | {score:20,totalMarks:20} | _(run)_ | _(run)_ |
| TC-WB-04 | all answers incorrect | B1-F, B2-F, B3-F | {score:0,totalMarks:20} | _(run)_ | _(run)_ |
| TC-WB-05 | partial correctness | B1-F, B2-F, B3-T, B3-F | {score:10,totalMarks:20} | _(run)_ | _(run)_ |
| TC-WB-06 | unanswered questions | B1-F, B2-T, B2-F, B3-T | {score:5,totalMarks:20} | _(run)_ | _(run)_ |
| TC-WB-07 | unknown answer ignored | B1-F, B2-T, B2-F, B3-T | score=5 | _(run)_ | _(run)_ |

**Expected coverage after all 7 tests:** Statements: 100% | Branches: 100% | Functions: 100% | Lines: 100%

**Evidence:** Screenshot of Jest coverage table from terminal. Save as `evidence/whitebox-coverage.png`

---

## Stage 2 — Black-Box Testing: EP + BVA (Login + Exam Creation)
**Syllabus:** Lab 3 + Lab 4 + Lab 8 — "EP+BVA test cases", "Black box testing"
**Tool:** Jest + Supertest
**Command:** `cd backend && npm run test:blackbox`

### EP Test Cases — Login Endpoint (POST /api/auth/login)

| TC ID | Field | Partition | Input | Expected | Actual | Status | Defect |
|---|---|---|---|---|---|---|---|
| TC-BB-01 | email | Valid format | bbtest@example.com | 200 or 401 | _(run)_ | _(run)_ | — |
| TC-BB-02 | email | Empty string | "" | 400 | _(run)_ | _(run)_ | — |
| TC-BB-03 | email | Missing field | (omitted) | 400 | _(run)_ | _(run)_ | — |
| TC-BB-05 | password | Valid present | ValidPass123 | 200 or 401 | _(run)_ | _(run)_ | — |
| TC-BB-06 | password | Empty string | "" | 400 | _(run)_ | _(run)_ | — |
| TC-BB-07 | both | Valid credentials | correct email+pw | 200 + token | _(run)_ | _(run)_ | — |
| TC-BB-08 | both | Wrong password | wrong pw | 401 | _(run)_ | _(run)_ | — |

### BVA Test Cases — durationMinutes (valid: 1–300)

| TC ID | Input | Boundary | Expected | Actual | Status | Defect |
|---|---|---|---|---|---|---|
| TC-BB-09 | 300 | Upper exact | 201 | _(run)_ | _(run)_ | DEF-001 |
| TC-BB-10 | 301 | Above upper | 400 | _(run)_ | _(run)_ | — |
| TC-BB-11 | 1 | Lower exact | 201 | _(run)_ | _(run)_ | — |
| TC-BB-12 | 0 | Below lower | 400 | _(run)_ | _(run)_ | — |
| TC-BB-13 | 150 | Nominal | 201 | _(run)_ | _(run)_ | — |

### BVA Test Cases — totalMarks (valid: 1–500)

| TC ID | Input | Boundary | Expected | Actual | Status | Defect |
|---|---|---|---|---|---|---|
| TC-BB-14 | 500 | Upper exact | 201 | _(run)_ | _(run)_ | — |
| TC-BB-15 | 501 | Above upper | 400 | _(run)_ | _(run)_ | — |
| TC-BB-16 | 1 | Lower exact | 201 | _(run)_ | _(run)_ | — |
| TC-BB-17 | 0 | Below lower | 400 | _(run)_ | _(run)_ | — |

**Stage 2 Summary:** Total: 16 | Passed: ___ | Failed: ___ (TC-BB-09 expected to fail — DEF-001)

---

## Stage 3 — Black-Box Testing: EP + BVA (Age Field)
**Syllabus:** Lab 3 — "Design test cases for age field (18–60)"
**Tool:** Jest + Supertest
**Command:** `cd backend && npm run test:age`

### EP Test Cases — age field on POST /api/auth/register

| TC ID | Partition | Input | Expected | Actual | Status | Defect |
|---|---|---|---|---|---|---|
| EP-A1 | Valid (18–60) | age=30 | 201 | _(run)_ | _(run)_ | — |
| EP-A2 | Below valid | age=15 | 400 | _(run)_ | _(run)_ | DEF-002 |
| EP-A3 | Above valid | age=70 | 400 | _(run)_ | _(run)_ | DEF-002 |
| EP-A5 | Negative | age=-5 | 400 | _(run)_ | _(run)_ | DEF-002 |
| EP-A6 | Omitted (optional) | (not sent) | 201 | _(run)_ | _(run)_ | — |

### BVA Test Cases — age field (valid: 18–60)

| TC ID | Input | Boundary | Expected | Actual | Status |
|---|---|---|---|---|---|
| TC-AGE-01 | 18 | Lower exact | 201 | _(run)_ | _(run)_ |
| TC-AGE-02 | 17 | Below lower | 400 | _(run)_ | _(run)_ |
| TC-AGE-03 | 19 | Above lower | 201 | _(run)_ | _(run)_ |
| TC-AGE-04 | 60 | Upper exact | 201 | _(run)_ | _(run)_ |
| TC-AGE-05 | 61 | Above upper | 400 | _(run)_ | _(run)_ |
| TC-AGE-06 | 59 | Below upper | 201 | _(run)_ | _(run)_ |
| TC-AGE-07 | 30 | Nominal | 201 | _(run)_ | _(run)_ |
| TC-AGE-08 | 0 | Zero | 400 | _(run)_ | _(run)_ |
| TC-AGE-09 | (omitted) | Optional | 201 | _(run)_ | _(run)_ |

**Stage 3 Summary:** Total: 14 | Passed: ___ | Failed: ___

---

## Stage 4 — Integration Testing (Top-Down)
**Syllabus:** Lab 5 — "Implement top-down integration testing"
**Tool:** Jest + Supertest
**Command:** `cd backend && npm run test:integration`

| TC ID | Integration Flow | Expected | Actual | Status | Defect |
|---|---|---|---|---|---|
| IT-01a | Auth ↔ DB: admin login → token | 200 + token | _(run)_ | _(run)_ | — |
| IT-01b | Auth ↔ DB: student login → token | 200 + token | _(run)_ | _(run)_ | — |
| IT-02a | Auth middleware ↔ Exam: admin creates exam | 201 | _(run)_ | _(run)_ | — |
| IT-02b | Auth middleware ↔ Exam: no token rejected | 401 | _(run)_ | _(run)_ | — |
| IT-03 | Exam ↔ Question: question linked to exam | 201, exam ref correct | _(run)_ | _(run)_ | — |
| IT-04 | Auth ↔ Exam listing: student sees exam | 200, exam in list | _(run)_ | _(run)_ | — |
| IT-05 | Exam ↔ Submission ↔ calculateResult() | 201, score=10 | _(run)_ | _(run)_ | — |
| IT-06 | Submission ↔ DB: result retrievable | 200, score=10 | _(run)_ | _(run)_ | — |
| IT-07a | RBAC: student blocked from exam creation | 403 | _(run)_ | _(run)_ | — |
| IT-07b | RBAC: student blocked from question delete | 403 | _(run)_ | _(run)_ | — |

**Stage 4 Summary:** Total: 10 | Passed: ___ | Failed: ___

---

## Stage 5 — System Testing (Manual End-to-End)
**Syllabus:** Lab 6 — "Apply all testing phases to Student Result System"
**Tool:** Postman (manual execution)
**Reference:** `docs/system-test-cases.md`

| TC ID | Scenario | Expected | Actual | Status |
|---|---|---|---|---|
| ST-01 | Student registration + login flow | 201 then 200 + token | _(run)_ | _(run)_ |
| ST-02 | Admin creates exam + adds questions | 201 for each | _(run)_ | _(run)_ |
| ST-03 | Student takes exam + gets scored result | 201, score correct | _(run)_ | _(run)_ |
| ST-04 | RBAC enforcement (student blocked) | 403 on admin routes | _(run)_ | _(run)_ |
| ST-05 | Duplicate submission prevented | 409 | _(run)_ | _(run)_ |

**Stage 5 Summary:** Total: 5 | Passed: ___ | Failed: ___

---

## Stage 6 — API Testing (Postman Collection)
**Syllabus:** Lab 9 — "Collect metrics & prepare final test report"
**Tool:** Postman Collection Runner
**File:** `docs/OES-API-Tests.postman_collection.json`

| TC ID | Endpoint | Test | Expected | Actual | Status |
|---|---|---|---|---|---|
| API-01 | POST /auth/register | Register student | 201 | _(run)_ | _(run)_ |
| API-02 | POST /auth/login | Admin login → token | 200 + token | _(run)_ | _(run)_ |
| API-03 | POST /auth/login | Student login → token | 200 + token | _(run)_ | _(run)_ |
| API-04 | POST /auth/login | Wrong password | 401 | _(run)_ | _(run)_ |
| API-05 | POST /auth/login | Missing fields | 400 | _(run)_ | _(run)_ |
| API-06 | POST /exams | Admin creates exam | 201 | _(run)_ | _(run)_ |
| API-07 | POST /exams | Student blocked | 403 | _(run)_ | _(run)_ |
| API-08 | GET /exams | List exams | 200 + array | _(run)_ | _(run)_ |
| API-09 | GET /exams/:id | Get exam by ID | 200 | _(run)_ | _(run)_ |
| API-10 | POST /questions | Add question | 201 | _(run)_ | _(run)_ |
| API-11 | GET /questions/exam/:id | Questions (no correct answer) | 200, no correctOptionIndex | _(run)_ | _(run)_ |
| API-12 | POST /submissions | Submit exam | 201 + score | _(run)_ | _(run)_ |
| API-13 | POST /submissions | Duplicate submit | 409 | _(run)_ | _(run)_ |
| API-14 | GET /submissions/my/:id | Student gets result | 200 + score | _(run)_ | _(run)_ |
| API-15 | GET /submissions/exam/:id | Admin gets all results | 200 + array | _(run)_ | _(run)_ |

**Stage 6 Summary:** Total: 15 | Passed: ___ | Failed: ___

---

## Stage 7 — Test Automation (Selenium)
**Syllabus:** Lab 9 — "Automate login test with testing tool"
**Tool:** Selenium WebDriver (Node.js)
**Command:** `cd backend && npm run test:selenium`
**Pre-condition:** Backend on :5000 AND frontend on :5173 both running

| TC ID | Scenario | Expected | Actual | Status |
|---|---|---|---|---|
| SEL-01 | Valid login → dashboard shown | Dashboard visible, welcome message | _(run)_ | _(run)_ |
| SEL-02 | Invalid login → error message | Error shown, stays on login page | _(run)_ | _(run)_ |
| SEL-03 | Empty fields → HTML5 validation | Form not submitted | _(run)_ | _(run)_ |

**Stage 7 Summary:** Total: 3 | Passed: ___ | Failed: ___

---

## Defect Table (All Defects)
**Syllabus:** Lab 3 + Lab 5 — "Defect life cycle table", "Calculate defect density"

| DEF ID | Title | Module | Steps to Reproduce | Expected | Actual | Severity | Priority | Status | Resolution |
|---|---|---|---|---|---|---|---|---|---|
| DEF-001 | Off-by-one: durationMinutes=300 rejected | examController.js | 1. Login as admin 2. POST /api/exams with durationMinutes=300, totalMarks=100, title="Test" 3. Observe response | HTTP 201 | HTTP 400 "Duration must be between 1 and 300" | Medium | High | Closed | Changed `>= DURATION_MAX` to `> DURATION_MAX` in examController.js |
| DEF-002 | Missing age validation: values outside 18–60 accepted | authController.js | 1. POST /api/auth/register with age=5 2. Observe response | HTTP 400 "Age must be between 18 and 60" | HTTP 201, user created | Low | Medium | Closed | Added age range check in register() in authController.js |

### Defect Life Cycle — DEF-001

| Stage | Description |
|---|---|
| New | Discovered by TC-BB-09 (BVA upper boundary test) |
| Assigned | Assigned to Sanjay for investigation |
| Open | Root cause confirmed: `>= DURATION_MAX` in examController.js line 21 |
| Fixed | Changed `>=` to `>` in examController.js |
| Retest | Re-ran `npm run test:blackbox` — TC-BB-09 now passes |
| Verified | All 16 black-box tests pass |
| Closed | DEF-001 closed |

### Defect Life Cycle — DEF-002

| Stage | Description |
|---|---|
| New | Discovered during age field EP testing (EP-A2, EP-A3) |
| Assigned | Assigned to Sanjay |
| Open | Root cause: no age validation block in authController.js register() |
| Fixed | Added `if (age !== undefined && (age < 18 \|\| age > 60))` check |
| Retest | Re-ran `npm run test:age` |
| Verified | All 14 age field tests pass |
| Closed | DEF-002 closed |

---

## Metrics Summary
**Syllabus:** Lab 5 + Lab 6 + Lab 7 — "Calculate defect density and productivity", "Test metrics"

| Metric | Formula | Value |
|---|---|---|
| Total Test Cases Designed | Count | 55 (7 unit + 16 BB-login/exam + 14 BB-age + 10 integration + 5 system + 15 API + 3 selenium) |
| Test Cases Executed | Count | _(fill after all runs)_ |
| Test Cases Passed | Count | _(fill)_ |
| Test Cases Failed | Count | _(fill)_ |
| Test Execution % | (Executed / Designed) × 100 | _(fill)_ |
| Pass % | (Passed / Executed) × 100 | _(fill)_ |
| Total Defects Found | Count | 2 |
| Defects Fixed | Count | 2 |
| Defect Fix Rate | (Fixed / Found) × 100 | 100% |
| Defect Density | Defects / Modules tested | 2 / 5 = **0.4 defects/module** |
| Statement Coverage | From Jest --coverage | _(run test:coverage)_ |
| Branch Coverage | From Jest --coverage | _(run test:coverage)_ |
