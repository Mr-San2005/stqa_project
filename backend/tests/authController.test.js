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
const { hashPassword, generateToken } = require("../src/utils/authUtils");
const { register } = require("../src/controllers/authController");

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
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

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
});
