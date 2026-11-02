/**
 * Lab 9 — Test Automation: Selenium WebDriver
 * Syllabus: "Automate login test with testing tool"
 *
 * Automates two scenarios against the OES React frontend (http://localhost:5173):
 *   SEL-01: Valid login → redirected to dashboard, welcome message shown
 *   SEL-02: Invalid login → error message displayed, stays on login page
 *
 * Pre-conditions:
 *   1. Backend running:  cd backend && npm run dev
 *   2. Frontend running: cd frontend && npm run dev
 *   3. A valid user exists in DB (email/password below must match a real user)
 *   4. chromedriver installed: npm install chromedriver (in backend/)
 *
 * Run: node tests/selenium/login.test.js
 */

const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

const BASE_URL = "http://localhost:5173";

// Use credentials of a real user already registered in your Atlas DB
const VALID_EMAIL    = "bbtest@example.com";   // created by blackbox.test.js beforeAll
const VALID_PASSWORD = "ValidPass123";
const WRONG_PASSWORD = "WrongPassword999";

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runTests() {
  const options = new chrome.Options();
  // Remove the line below if you want to watch the browser — headless hides it
  // options.addArguments("--headless=new");

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  let passed = 0;
  let failed = 0;
  const results = [];

  async function assert(label, condition) {
    if (condition) {
      console.log(`  ✓ ${label}`);
      results.push({ label, status: "PASS" });
      passed++;
    } else {
      console.error(`  ✗ ${label}`);
      results.push({ label, status: "FAIL" });
      failed++;
    }
  }

  try {
    // ── SEL-01: Valid login ──────────────────────────────────────────────────
    console.log("\nSEL-01: Valid login → dashboard");

    await driver.get(BASE_URL);
    await driver.wait(until.elementLocated(By.id("login-form")), 5000);

    await driver.findElement(By.id("email")).sendKeys(VALID_EMAIL);
    await driver.findElement(By.id("password")).sendKeys(VALID_PASSWORD);
    await driver.findElement(By.id("login-btn")).click();

    // Wait for dashboard to appear
    await driver.wait(until.elementLocated(By.id("dashboard")), 5000);

    const welcomeText = await driver.findElement(By.id("welcome-message")).getText();
    await assert("Dashboard is displayed after valid login", welcomeText.includes("Welcome"));
    await assert("Welcome message contains role", welcomeText.includes("admin") || welcomeText.includes("student"));

    // Logout to reset state for next test
    await driver.findElement(By.id("logout-btn")).click();
    await driver.wait(until.elementLocated(By.id("login-form")), 5000);
    await assert("Logout returns to login page", true);

    // ── SEL-02: Invalid login ────────────────────────────────────────────────
    console.log("\nSEL-02: Invalid login → error message shown");

    await driver.findElement(By.id("email")).sendKeys(VALID_EMAIL);
    await driver.findElement(By.id("password")).sendKeys(WRONG_PASSWORD);
    await driver.findElement(By.id("login-btn")).click();

    await driver.wait(until.elementLocated(By.id("error-message")), 5000);
    const errorText = await driver.findElement(By.id("error-message")).getText();
    await assert("Error message is displayed for wrong password", errorText.length > 0);
    await assert("Still on login page (no dashboard)", !(await driver.findElements(By.id("dashboard"))).length);

    // ── SEL-03: Empty fields ─────────────────────────────────────────────────
    console.log("\nSEL-03: Empty fields → browser validation prevents submit");

    await driver.navigate().refresh();
    await driver.wait(until.elementLocated(By.id("login-btn")), 3000);
    await driver.findElement(By.id("login-btn")).click();
    await sleep(500);
    // HTML5 required attribute prevents submission — login-form still visible
    const formStillVisible = (await driver.findElements(By.id("login-form"))).length > 0;
    await assert("Form not submitted when fields are empty (HTML5 validation)", formStillVisible);

  } finally {
    await driver.quit();

    // ── Print summary ────────────────────────────────────────────────────────
    console.log("\n" + "=".repeat(50));
    console.log("Selenium Test Summary");
    console.log("=".repeat(50));
    results.forEach(r => console.log(`  ${r.status === "PASS" ? "✓" : "✗"} ${r.label}`));
    console.log(`\nTotal: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    console.log("=".repeat(50));

    if (failed > 0) process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Selenium runner error:", err.message);
  process.exit(1);
});
