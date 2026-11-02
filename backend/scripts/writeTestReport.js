const fs = require("node:fs");
const path = require("node:path");

const reportPath = path.join(__dirname, "..", "test-results", "jest-report.json");
const outputPath = path.join(__dirname, "..", "..", "reports", "latest-test-report.md");
const outcome = process.env.TEST_OUTCOME || "not run";
const timestamp = new Date().toISOString();
let report;
let reportReadError;

try {
  report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (error) {
  reportReadError = error.message;
}

const passed = outcome === "success" && report?.success === true;
const lines = [
  "# Latest CI Test Report",
  "",
  `- **Status:** ${passed ? "PASS" : "FAIL"}`,
  `- **Generated:** ${timestamp}`,
  `- **Commit:** ${process.env.COMMIT_SHA || "unknown"}`,
  `- **Workflow run:** ${process.env.RUN_URL || "local run"}`,
];

if (report) {
  lines.push(
    `- **Test suites:** ${report.numPassedTestSuites || 0} passed / ${report.numFailedTestSuites || 0} failed / ${report.numTotalTestSuites || 0} total`,
    `- **Tests:** ${report.numPassedTests || 0} passed / ${report.numFailedTests || 0} failed / ${report.numTotalTests || 0} total`,
    "",
    "## Failed tests",
    "",
  );

  const failures = (report.testResults || []).flatMap((suite) =>
    (suite.assertionResults || [])
      .filter((test) => test.status === "failed")
      .map((test) => ({ file: suite.name, title: test.fullName, message: test.failureMessages?.[0] })),
  );
  const failedSuites = (report.testResults || []).filter(
    (suite) =>
      suite.status === "failed" &&
      !(suite.assertionResults || []).some((test) => test.status === "failed"),
  );

  if (failures.length === 0 && failedSuites.length === 0) {
    lines.push("No failed test cases.");
  } else {
    for (const failure of failures) {
      lines.push(`### ${failure.title}`, "", `File: \`${failure.file}\``, "");
      if (failure.message) {
        lines.push("```text", failure.message.slice(0, 4000), "```", "");
      }
    }
    for (const suite of failedSuites) {
      lines.push(`### Test suite failed: \`${suite.name}\``, "");
      if (suite.message) {
        lines.push("```text", suite.message.slice(0, 4000), "```", "");
      }
    }
  }
} else {
  lines.push(
    `- **Test command outcome:** ${outcome}`,
    "",
    "## Report generation details",
    "",
    "Jest did not produce a readable JSON report.",
    "",
    "```text",
    reportReadError || "No additional error information was available.",
    "```",
  );
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`);
console.log(`Wrote test report to ${outputPath}`);
