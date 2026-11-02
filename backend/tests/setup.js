// Suppress dotenv's "injected env already loaded" diagnostic.
// dotenv v18 prints to console.error when called more than once per process.
// We silence it here since setup.js runs before every test worker.
const originalError = console.error;
console.error = () => {};
require("dotenv").config();
console.error = originalError;
