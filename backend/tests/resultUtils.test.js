const { calculateResult } = require("../src/utils/resultUtils");

describe("calculateResult", () => {
  const questions = [
    { _id: "q1", correctOptionIndex: 1, marks: 5 },
    { _id: "q2", correctOptionIndex: 2, marks: 10 },
    { _id: "q3", correctOptionIndex: 0, marks: 5 },
  ];

  test("returns 0/0 for empty question list", () => {
    const result = calculateResult([], []);
    expect(result).toEqual({ score: 0, totalMarks: 0 });
  });

  test("returns 0/0 for invalid (non-array) question input", () => {
    const result = calculateResult(null, []);
    expect(result).toEqual({ score: 0, totalMarks: 0 });
  });

  test("awards full marks when all answers correct", () => {
    const answers = [
      { question: "q1", selectedOptionIndex: 1 },
      { question: "q2", selectedOptionIndex: 2 },
      { question: "q3", selectedOptionIndex: 0 },
    ];
    const result = calculateResult(questions, answers);
    expect(result).toEqual({ score: 20, totalMarks: 20 });
  });

  test("awards zero when all answers incorrect", () => {
    const answers = [
      { question: "q1", selectedOptionIndex: 0 },
      { question: "q2", selectedOptionIndex: 0 },
      { question: "q3", selectedOptionIndex: 1 },
    ];
    const result = calculateResult(questions, answers);
    expect(result).toEqual({ score: 0, totalMarks: 20 });
  });

  test("handles partial correctness", () => {
    const answers = [
      { question: "q1", selectedOptionIndex: 1 }, // correct, +5
      { question: "q2", selectedOptionIndex: 0 }, // wrong
      { question: "q3", selectedOptionIndex: 0 }, // correct, +5
    ];
    const result = calculateResult(questions, answers);
    expect(result).toEqual({ score: 10, totalMarks: 20 });
  });

  test("skips unanswered questions without penalty", () => {
    const answers = [
      { question: "q1", selectedOptionIndex: 1 }, // correct, +5
      // q2 and q3 unanswered
    ];
    const result = calculateResult(questions, answers);
    expect(result).toEqual({ score: 5, totalMarks: 20 });
  });

  test("ignores extra/unknown answers not matching any question", () => {
    const answers = [
      { question: "q1", selectedOptionIndex: 1 },
      { question: "unknown_q", selectedOptionIndex: 0 },
    ];
    const result = calculateResult(questions, answers);
    expect(result.score).toBe(5);
  });
});