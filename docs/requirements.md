# Requirements Specification — Online Examination System

## 1. Functional Requirements

### 1.1 Student Module

| ID | Requirement |
|------|-------------|
| FR-01 | System shall allow a new student to register with name, email, password, and (optionally) age |
| FR-02 | System shall allow a registered student to log in with email and password |
| FR-03 | System shall display a list of available examinations to a logged-in student |
| FR-04 | System shall display exam instructions (duration, number of questions, marks) before start |
| FR-05 | System shall allow a student to start an exam within its availability window |
| FR-06 | System shall present multiple-choice questions one at a time or in a navigable list |
| FR-07 | System shall allow a student to navigate between questions and change answers before submission |
| FR-08 | System shall allow a student to submit the exam |
| FR-09 | System shall automatically calculate the result upon submission |
| FR-10 | System shall allow a student to view their result after submission |

### 1.2 Admin Module

| ID | Requirement |
|------|-------------|
| FR-11 | System shall allow an admin to log in with valid credentials |
| FR-12 | System shall allow an admin to create a new examination (title, duration, total marks) |
| FR-13 | System shall allow an admin to add multiple-choice questions to an exam |
| FR-14 | System shall allow an admin to edit an existing question |
| FR-15 | System shall allow an admin to delete a question |
| FR-16 | System shall allow an admin to set the correct answer for each question |
| FR-17 | System shall allow an admin to set marks per question |
| FR-18 | System shall allow an admin to view a list of all created exams |
| FR-19 | System shall allow an admin to view results of students who attempted an exam |

## 2. Non-Functional Requirements

| ID | Category | Requirement |
|------|----------|-------------|
| NFR-01 | Performance | Result calculation shall complete within 2 seconds of submission |
| NFR-02 | Security | Passwords shall be stored hashed, never in plain text |
| NFR-03 | Security | A student shall not be able to access admin-only routes |
| NFR-04 | Usability | Exam navigation UI shall clearly indicate answered vs. unanswered questions |
| NFR-05 | Reliability | An exam in progress shall not lose answers on page refresh (stretch goal — status TBD) |
| NFR-06 | Data Integrity | A submitted exam shall not be re-editable |

## 3. Out of Scope

- Payment systems
- Video proctoring
- AI-based question generation
- Chat / messaging features
- Forgot password / email recovery flow