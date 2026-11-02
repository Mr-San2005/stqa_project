const fs = require("node:fs");
const path = require("node:path");

const reportPath = path.join(__dirname, "..", "test-results", "jest-report.json");
const coveragePath = path.join(__dirname, "..", "coverage", "coverage-summary.json");
const outputPath = path.join(__dirname, "..", "..", "reports", "latest-test-report.md");
const outcome = process.env.TEST_OUTCOME || "not run";
const installOutcome = process.env.INSTALL_OUTCOME || "unknown";
const timestamp = new Date().toISOString();
let report;
let reportReadError;
let coverage;

try {
  report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
} catch (error) {
  reportReadError = error.message;
}

try {
  coverage = JSON.parse(fs.readFileSync(coveragePath, "utf8"));
} catch {
  coverage = undefined;
}

const passed = outcome === "success" && report?.success === true;
const lines = [
  "# Latest CI Test Report",
  "",
  `- **Status:** ${passed ? "PASS" : "FAIL"}`,
  `- **Generated:** ${timestamp}`,
  `- **Commit:** ${process.env.COMMIT_SHA || "unknown"}`,
  `- **Branch:** ${process.env.BRANCH_NAME || "unknown"}`,
  `- **Workflow run:** ${process.env.RUN_URL || "local run"}`,
  `- **Node.js:** ${process.version}`,
  `- **Dependency installation:** ${installOutcome}`,
  `- **Unit-test command:** ${outcome}`,
];

if (report) {
  const pendingTests = report.numPendingTests || 0;
  const skippedTests = report.numTodoTests || 0;
  const durationMs = report.endTime && report.startTime
    ? Math.max(0, report.endTime - report.startTime)
    : undefined;
  lines.push(
    `- **Test suites:** ${report.numPassedTestSuites || 0} passed / ${report.numFailedTestSuites || 0} failed / ${report.numTotalTestSuites || 0} total`,
    `- **Tests:** ${report.numPassedTests || 0} passed / ${report.numFailedTests || 0} failed / ${pendingTests + skippedTests} skipped / ${report.numTotalTests || 0} total`,
  );
  if (durationMs !== undefined) lines.push(`- **Duration:** ${(durationMs / 1000).toFixed(2)} seconds`);
  lines.push("");

  if (coverage?.total) {
    const metrics = coverage.total;
    lines.push(
      "## Coverage for files exercised by unit tests",
      "",
      "| Metric | Covered | Total | Coverage |",
      "| --- | ---: | ---: | ---: |",
      ...["lines", "statements", "functions", "branches"].map(
        (key) =>
          `| ${key} | ${metrics[key]?.covered || 0} | ${metrics[key]?.total || 0} | ${metrics[key]?.pct || 0}% |`,
      ),
      "",
    );

    const files = Object.entries(coverage)
      .filter(([file]) => file !== "total")
      .map(([file, metrics]) => ({
        file: path.relative(path.join(__dirname, ".."), file).split(path.sep).join("/"),
        lines: metrics.lines?.pct || 0,
        branches: metrics.branches?.pct || 0,
      }));

    if (files.length > 0) {
      lines.push(
        "| File | Line coverage | Branch coverage |",
        "| --- | ---: | ---: |",
        ...files.map((file) => `| \`${file.file}\` | ${file.lines}% | ${file.branches}% |`),
        "",
      );
    }
  }

  lines.push("## Test failures", "");
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
      lines.push(
        `### ${failure.title}`,
        "",
        `File: \`${failure.file}\``,
        "",
      );
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
const markdown = `${lines.join("\n")}\n`;
fs.writeFileSync(outputPath, markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, markdown);
}

console.log(`Wrote test report to ${outputPath}`);
