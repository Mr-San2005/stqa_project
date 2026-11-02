# Test Plan — Online Examination System
**Document ID:** TP-OES-01 | **Standard:** IEEE 829 | **Version:** 2.0
**Project:** Online Examination System (MERN Stack)
**Tester:** Sanjay | **Course:** BIS702 — Software Testing and Quality Assurance

---

## 1. Test Plan Identifier
TP-OES-01

## 2. Introduction
This test plan covers all testing activities for the Online Examination System,
a MERN-stack web application supporting student exam-taking and admin exam
management. Requirements are specified in `docs/requirements.md` (FR-01 to
FR-19, NFR-01 to NFR-06).

This document satisfies **Lab 2** (IEEE-829 test plan) and **Lab 7**
(test plan for the result calculation system) of BIS702.

---

## 3. Test Items
- Authentication module: register (`POST /api/auth/register`), login (`POST /api/auth/login`)
- Exam management module: create, list, get by ID (`/api/exams`)
- Question management module: add, edit, delete, list by exam (`/api/questions`)
- Submission module: submit exam, get result (`/api/submissions`)
- Result calculation utility: `calculateResult()` in `backend/src/utils/resultUtils.js`

---

## 4. Features to be Tested

| Feature | Requirement | Test Type |
|---|---|---|
| Student registration | FR-01 | Black-Box EP/BVA (age field) |
| Student login | FR-02 | Black-Box EP/BVA |
| Admin login | FR-11 | Black-Box EP/BVA |
| Exam creation with validation | FR-12 | Black-Box BVA (duration, marks) |
| Question management | FR-13–FR-17 | Integration Testing |
| Exam listing | FR-03 | Integration Testing |
| Exam submission + auto-scoring | FR-08, FR-09 | Integration + Unit (White-Box) |
| Result retrieval | FR-10 | Integration Testing |
| Admin result view | FR-19 | Integration Testing |
| Role-based access control | NFR-03 | Integration Testing |
| Password hashing | NFR-02 | Unit Testing |
| No re-submission | NFR-06 | Integration Testing |

## 5. Features Not to be Tested
- Payment systems, video proctoring, chat (out of scope per requirements.md §3)
- Frontend UI components (backend API testing only in automated tests)

---

## 6. Approach

### 6.1 SDLC Model Used
This project follows a **hybrid model**: requirements were fixed upfront
(Waterfall-style), but implementation and testing were done module by module
(Agile-style). This is appropriate for a bounded lab mini-project.

**Waterfall phases applied:**
Requirements → Design → Implementation → Testing → Reporting

**Agile element:** Testing was embedded alongside each module's implementation
(shift-left), not deferred to a single phase at the end.

### 6.2 Testing Techniques Applied

| Technique | Syllabus Lab | Applied To | Tool/File |
|---|---|---|---|
| Verification (static review) | Lab 2 | Login feature code review | Section 7 below |
| Black-Box EP + BVA | Lab 3, Lab 4, Lab 8 | Login fields, age field, exam duration/marks | `tests/blackbox.test.js`, `tests/ageField.test.js` |
| White-Box: statement + branch coverage | Lab 4, Lab 8 | `calculateResult()` | `tests/resultUtils.test.js` + `npm run test:coverage` |
| Top-Down Integration Testing | Lab 5 | Login→Exam→Question→Submission→Result→DB | `tests/integration.test.js` |
| System Testing | Lab 6 | Full end-to-end user flows | `docs/system-test-cases.md` |
| Test Automation | Lab 9 | Login + exam-taking workflow | `tests/selenium/login.test.js` |
| API Testing | Lab 9 | All REST endpoints | Postman collection `docs/OES-API-Tests.postman_collection.json` |
| Test Metrics | Lab 6, Lab 7 | Defect density, pass %, coverage % | `docs/test-execution-log.md` §Metrics |

---

## 7. Verification Checklist (Lab 2 — Static Review of Login Feature)

Verification = "Are we building the product right?" — checked against
requirements WITHOUT executing code.

| ID | Item | Req Ref | File | Line | Pass? |
|---|---|---|---|---|---|
| V-01 | Login route is POST /api/auth/login | FR-02 | `routes/authRoutes.js` | 5 | ✓ |
| V-02 | Missing email returns 400 | FR-02 | `controllers/authController.js` | 41 | ✓ |
| V-03 | Missing password returns 400 | FR-02 | `controllers/authController.js` | 41 | ✓ |
| V-04 | Password compared via bcrypt, not plain text | NFR-02 | `utils/authUtils.js` | 13 | ✓ |
| V-05 | Wrong credentials return 401 | FR-02 | `controllers/authController.js` | 50 | ✓ |
| V-06 | Successful login returns JWT token | FR-02 | `controllers/authController.js` | 53 | ✓ |
| V-07 | JWT contains user id and role | NFR-03 | `utils/authUtils.js` | 14 | ✓ |
| V-08 | Token has expiry set (not infinite) | NFR-03 | `utils/authUtils.js` | 16 | ✓ |
| V-09 | Response includes id, name, email, role | FR-02 | `controllers/authController.js` | 56 | ✓ |
| V-10 | Password never returned in response | NFR-02 | `controllers/authController.js` | 56 | ✓ |
| V-11 | Admin uses same login endpoint, role in JWT | FR-11 | `routes/authRoutes.js` | 5 | ✓ |
| V-12 | Email stored lowercase (case-insensitive lookup) | FR-02 | `models/User.js` | 6 | ✓ |

**Verification result:** All 12 items pass static review. No structural defects found.

---

## 8. Item Pass/Fail Criteria
A test case **passes** if the actual HTTP status code and response body match
the expected values exactly.
A **defect** is logged for any failure, with severity and priority assigned
per the defect table in `docs/test-execution-log.md`.

---

## 9. Suspension/Resumption Criteria
Testing is **suspended** if a Critical-severity defect prevents further
execution (e.g. server crashes on startup, DB connection fails).
Testing **resumes** once the defect is fixed and the server starts cleanly.

---

## 10. Test Deliverables

| Deliverable | Location |
|---|---|
| This test plan | `docs/test-plan.md` |
| Black-box test cases (EP+BVA) | `tests/blackbox.test.js`, `tests/ageField.test.js` |
| White-box unit tests + coverage | `tests/resultUtils.test.js`, `npm run test:coverage` |
| Integration tests | `tests/integration.test.js` |
| System test cases | `docs/system-test-cases.md` |
| Selenium automation script | `tests/selenium/login.test.js` |
| Postman API collection | `docs/OES-API-Tests.postman_collection.json` |
| Test execution log + defect table | `docs/test-execution-log.md` |
| Final test report | `docs/final-test-report.md` |

---

## 11. Environmental Needs
- Node.js v18+, npm
- MongoDB Atlas (connection string in `backend/.env`)
- Jest + Supertest (installed in `backend/devDependencies`)
- Google Chrome + ChromeDriver (for Selenium)
- Postman (for API collection execution)

---

## 12. Responsibilities
Single developer/tester: Sanjay

---

## 13. Schedule

| Activity | Technique | Status |
|---|---|---|
| Unit tests — auth utils + result calc | White-Box | ✓ Done |
| Black-box EP+BVA — login + exam creation | Black-Box | ✓ Done |
| Black-box EP+BVA — age field (DEF-002) | Black-Box | ✓ Done |
| White-box coverage report | White-Box | Run: `npm run test:coverage` |
| Integration tests — top-down flow | Integration | ✓ Done |
| System testing — manual end-to-end | System | See `docs/system-test-cases.md` |
| Selenium automation — login flow | Automation | `tests/selenium/login.test.js` |
| API testing — Postman collection | API Testing | `docs/OES-API-Tests.postman_collection.json` |
| Metrics + final report | Metrics | `docs/final-test-report.md` |

---

## 14. Risks and Contingencies

| Risk | Contingency |
|---|---|
| MongoDB Atlas connection timeout in tests | Increase Jest timeout to 30s (configured in package.json) |
| Selenium ChromeDriver version mismatch | Use `chromedriver` npm package that auto-matches Chrome version |
| Seeded defects not realistic enough | DEF-001 (off-by-one BVA) and DEF-002 (missing validation) are tied to real boundary conditions |
