# Test Plan — Online Examination System

## 1. Test Plan Identifier
TP-OES-01

## 2. Introduction
This test plan covers testing for the Online Examination System, covering
student and admin modules, as specified in requirements FR-01 to FR-19
and NFR-01 to NFR-06.

## 3. Test Items
- Authentication module (register/login)
- Exam management module (admin)
- Question management module (admin)
- Exam-taking module (student)
- Result calculation module

## 4. Features to be Tested
- User registration and login (FR-01, FR-02, FR-11)
- Exam creation and question management (FR-12–FR-17)
- Exam listing and instructions (FR-03, FR-04)
- Exam attempt flow: start, navigate, submit (FR-05–FR-08)
- Result calculation and display (FR-09, FR-10)
- Admin result viewing (FR-19)
- Access control between student/admin roles (NFR-03)

## 5. Features Not to be Tested
- Payment, video proctoring, chat (out of scope — not implemented)

## 6. Approach
- Unit Testing: Jest, applied to backend logic (esp. result calculation)
- API Testing: Postman + Supertest, applied to all REST endpoints
- Black-Box Testing: Equivalence Partitioning + Boundary Value Analysis
  applied to login fields, exam duration, marks, question count
- White-Box Testing: statement/branch coverage on calculateResult()
- Integration Testing: module-to-module flows (login→dashboard→exam→
  submission→result→DB)
- System Testing: full end-to-end manual pass
- Automation: Selenium for login + full exam attempt flow

## 7. Item Pass/Fail Criteria
A test case passes if actual result matches expected result exactly.
A defect is logged for any failure, per severity/priority defined in the
Defect Report template.

## 8. Suspension/Resumption Criteria
Testing is suspended if a blocking defect (severity: Critical) prevents
further test execution; resumes once the defect is fixed and verified.

## 9. Test Deliverables
Test plan, test cases (black-box, white-box, integration, system),
Selenium scripts, Postman collection, defect reports, coverage reports,
test execution summary, final test report.

## 10. Environmental Needs
Node.js, MongoDB (local or Atlas), Chrome browser (for Selenium),
Postman.

## 11. Responsibilities
Single developer/tester: [Sanjay]

## 12. Schedule
Aligned with development stages (see project roadmap).

## 13. Risks and Contingencies
- Risk: Limited time to cover all test types deeply
  Contingency: Prioritize black-box + white-box + one automation flow
- Risk: Deliberately seeded defects not realistic enough
  Contingency: Choose defects tied to real edge cases (boundary values,
  off-by-one errors in scoring) 