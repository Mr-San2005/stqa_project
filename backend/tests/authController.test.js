jest.mock("../src/models/User", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../src/utils/authUtils", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
}));

const User = require("../src/models/User");
const { hashPassword, comparePassword, generateToken } = require("../src/utils/authUtils");
const { register, login } = require("../src/controllers/authController");

function createResponse() {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  return res;
}

describe("authController.register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-password");
    generateToken.mockReturnValue("signed-token");
    User.create.mockResolvedValue({
      _id: "user-id",
      name: "New Student",
      email: "student@example.com",
      role: "student",
    });
  });

  test("registers as student and returns an authenticated session even if admin role is requested", async () => {
    const req = {
      body: {
        name: "New Student",
        email: "student@example.com",
        password: "password",
        role: "admin",
      },
    };
    const res = createResponse();

    await register(req, res);

    expect(User.create).toHaveBeenCalledWith({
      name: "New Student",
      email: "student@example.com",
      password: "hashed-password",
      age: undefined,
      role: "student",
    });
    expect(generateToken).toHaveBeenCalledWith(expect.objectContaining({ role: "student" }));
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "User registered successfully",
      token: "signed-token",
      user: { id: "user-id", name: "New Student", email: "student@example.com", role: "student" },
    });
  });

  test.each([
    ["name", { email: "student@example.com", password: "password" }],
    ["email", { name: "New Student", password: "password" }],
    ["password", { name: "New Student", email: "student@example.com" }],
  ])("rejects registration with missing %s", async (_field, body) => {
    const res = createResponse();

    await register({ body }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Name, email, and password are required",
    });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test.each([17, 61])("rejects registration with age %s", async (age) => {
    const res = createResponse();

    await register({
      body: { name: "New Student", email: "student@example.com", password: "password", age },
    }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Age must be between 18 and 60" });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects duplicate email addresses", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-user" });
    const res = createResponse();

    await register({
      body: { name: "New Student", email: "student@example.com", password: "password" },
    }, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ message: "Email already registered" });
    expect(hashPassword).not.toHaveBeenCalled();
  });

  test("returns an error response when registration storage fails", async () => {
    User.findOne.mockRejectedValue(new Error("database unavailable"));
    const res = createResponse();

    await register({
      body: { name: "New Student", email: "student@example.com", password: "password" },
    }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "database unavailable",
    });
  });
});

describe("authController.login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    User.findOne.mockResolvedValue(null);
    comparePassword.mockResolvedValue(false);
  });

  test.each([
    ["email", { password: "password" }],
    ["password", { email: "student@example.com" }],
  ])("rejects login with missing %s", async (_field, body) => {
    const res = createResponse();

    await login({ body }, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Email and password are required" });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  test("rejects login when the account does not exist", async () => {
    const res = createResponse();

    await login({ body: { email: "missing@example.com", password: "password" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    expect(comparePassword).not.toHaveBeenCalled();
  });

  test("rejects login when the password does not match", async () => {
    User.findOne.mockResolvedValue({ password: "hashed-password" });
    comparePassword.mockResolvedValue(false);
    const res = createResponse();

    await login({ body: { email: "student@example.com", password: "wrong-password" } }, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    expect(generateToken).not.toHaveBeenCalled();
  });

  test("returns an authenticated session for valid credentials", async () => {
    const user = {
      _id: "user-id",
      name: "Student",
      email: "student@example.com",
      role: "student",
      password: "hashed-password",
    };
    User.findOne.mockResolvedValue(user);
    comparePassword.mockResolvedValue(true);
    generateToken.mockReturnValue("signed-token");
    const res = createResponse();

    await login({ body: { email: user.email, password: "password" } }, res);

    expect(generateToken).toHaveBeenCalledWith(user);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login successful",
      token: "signed-token",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  });

  test("returns an error response when login storage fails", async () => {
    User.findOne.mockRejectedValue(new Error("database unavailable"));
    const res = createResponse();

    await login({ body: { email: "student@example.com", password: "password" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Server error",
      error: "database unavailable",
    });
  });
});
