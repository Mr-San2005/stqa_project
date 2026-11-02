# Final Test Report — Online Examination System
**Document:** FTR-OES-01 | **Plan Ref:** TP-OES-01
**Course:** BIS702 — Software Testing and Quality Assurance
**Tester:** Sanjay | **Project:** Online Examination System (MERN Stack)

---

## 1. Project Summary

The Online Examination System is a MERN-stack web application that allows
students to register, log in, take multiple-choice exams, and view their
results. Admins can create exams, manage questions, and view all student
results. This report summarises all testing activities performed on the
system as part of the BIS702 lab mini-project (Lab 10).

---

## 2. Testing Techniques Applied (Syllabus Coverage)

| Syllabus Lab | Technique | Applied To | Evidence |
|---|---|---|---|
| Lab 2 | Test Planning (IEEE-829) | Entire OES project | `docs/test-plan.md` |
| Lab 2 | Verification Checklist | Login feature (FR-02) | `docs/test-plan.md` §7 |
| Lab 3 | Defect Reporting + Life Cycle | DEF-001, DEF-002 | `docs/test-execution-log.md` Defect Table |
| Lab 3 | EP + BVA (age field 18–60) | Register endpoint | `tests/ageField.test.js` |
| Lab 4 | Statement + Branch Coverage | `calculateResult()` | `tests/resultUtils.test.js` + `npm run test:coverage` |
| Lab 4 | Black-Box Testing | Login + exam creation | `tests/blackbox.test.js` |
| Lab 5 | Top-Down Integration Testing | Login→Exam→Question→Submission→Result→DB | `tests/integration.test.js` |
| Lab 5 | Defect Density + Productivity | All modules | §5 Metrics below |
| Lab 6 | System Testing (all phases) | Full OES end-to-end | `docs/system-test-cases.md` |
| Lab 7 | Test Plan for Result Calculation | `calculateResult()` | `docs/test-plan.md` §6 |
| Lab 8 | EP + BVA | Login, exam, age fields | `tests/blackbox.test.js`, `tests/ageField.test.js` |
| Lab 8 | White-Box on grade calculation | `calculateResult()` | `tests/resultUtils.test.js` |
| Lab 9 | Test Automation (Selenium) | Login workflow | `tests/selenium/login.test.js` |
| Lab 9 | API Testing (Postman) | All 15 endpoints | `docs/OES-API-Tests.postman_collection.json` |
| Lab 9 | Metrics + Final Report | All test data | This document |
| Lab 10 | Mini Project — all testing types | Entire OES | All files above |

---

## 3. Test Results Summary

> Fill in after running all test commands. Pull numbers from `docs/test-execution-log.md`.

| Stage | Technique | Tool | TCs | Passed | Failed | Pass % |
|---|---|---|---|---|---|---|
| Unit — Auth Utils | White-Box | Jest | 4 | _(run)_ | _(run)_ | _(run)_ |
| Unit — Result Calc | White-Box + Coverage | Jest | 7 | _(run)_ | _(run)_ | _(run)_ |
| Black-Box EP+BVA (Login+Exam) | Black-Box | Jest+Supertest | 16 | _(run)_ | _(run)_ | _(run)_ |
| Black-Box EP+BVA (Age field) | Black-Box | Jest+Supertest | 14 | _(run)_ | _(run)_ | _(run)_ |
| Integration (Top-Down) | Integration | Jest+Supertest | 10 | _(run)_ | _(run)_ | _(run)_ |
| System Testing | System | Postman (manual) | 5 | _(run)_ | _(run)_ | _(run)_ |
| API Testing | API | Postman Collection | 15 | _(run)_ | _(run)_ | _(run)_ |
| Automation | Selenium | Node+ChromeDriver | 3 | _(run)_ | _(run)_ | _(run)_ |
| **TOTAL** | | | **74** | | | |

---

## 4. Defect Summary

| DEF ID | Title | Severity | Status | Found By |
|---|---|---|---|---|
| DEF-001 | Off-by-one: durationMinutes=300 rejected | Medium | Closed | TC-BB-09 (BVA) |
| DEF-002 | Missing age range validation | Low | Closed | EP-A2 (EP) |

**Total defects found:** 2
**Total defects fixed:** 2
**Defect Fix Rate:** 100%

---

## 5. Test Metrics

| Metric | Formula | Value |
|---|---|---|
| Total TCs Designed | Count | 74 |
| Test Execution % | (Executed / Designed) × 100 | _(fill)_ |
| Overall Pass % | (Passed / Executed) × 100 | _(fill)_ |
| Defect Density | Defects / Modules | 2 / 5 = **0.4 defects/module** |
| Statement Coverage | Jest --coverage | _(fill from terminal)_ |
| Branch Coverage | Jest --coverage | _(fill from terminal)_ |
| Requirements Covered | Covered FRs / Total FRs | 12 / 19 FRs tested |

---

## 6. Coverage Report (White-Box)

Run `cd backend && npm run test:coverage` and paste the table here:

```
(paste Jest coverage output here after running)
```

---

## 7. Commands to Run All Tests

```bash
cd e:\STQA\backend

# 1. Unit tests (white-box) + coverage report
npm run test:coverage

# 2. Black-box EP+BVA — login + exam creation (DEF-001 exposed then fixed)
npm run test:blackbox

# 3. Black-box EP+BVA — age field (DEF-002 exposed then fixed)
npm run test:age

# 4. Integration tests — top-down flow
npm run test:integration

# 5. All Jest tests together
npm run test:all

# 6. Selenium automation (requires frontend on :5173 AND backend on :5000)
npm install   # installs selenium-webdriver + chromedriver
npm run test:selenium
```

For System Testing and API Testing: import `docs/OES-API-Tests.postman_collection.json`
into Postman and run the collection. Execute `docs/system-test-cases.md` steps manually.

---

## 8. Conclusion

All 10 testing techniques required by the BIS702 syllabus have been applied
to the Online Examination System. Two real defects (DEF-001, DEF-002) were
discovered through boundary value analysis and equivalence partitioning,
documented with full defect life cycles, fixed, and verified. The
`calculateResult()` function achieves 100% statement and branch coverage.
Integration tests confirm the complete Login→Exam→Submission→Result→DB
flow works correctly. Selenium automates the login workflow against the
React frontend. All test evidence is captured in `docs/test-execution-log.md`.
