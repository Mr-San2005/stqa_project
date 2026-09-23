require("dotenv").config({ quiet: true });
const { hashPassword, comparePassword, generateToken } = require("../src/utils/authUtils");
const jwt = require("jsonwebtoken");

describe("authUtils", () => {
  test("hashPassword produces a hash different from the original", async () => {
    const hashed = await hashPassword("mypassword123");
    expect(hashed).not.toBe("mypassword123");
  });

  test("comparePassword returns true for correct password", async () => {
    const hashed = await hashPassword("mypassword123");
    const result = await comparePassword("mypassword123", hashed);
    expect(result).toBe(true);
  });

  test("comparePassword returns false for incorrect password", async () => {
    const hashed = await hashPassword("mypassword123");
    const result = await comparePassword("wrongpassword", hashed);
    expect(result).toBe(false);
  });

  test("generateToken returns a valid JWT containing user id and role", () => {
    const fakeUser = { _id: "abc123", role: "student" };
    const token = generateToken(fakeUser);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe("abc123");
    expect(decoded.role).toBe("student");
  });
});