// import jest from "@jest/globals";

// const mockePrisma = {
//   user: {
//     findFirst: jest.fn(),
//     findUnique: jest.fn(),
//     create: jest.fn(),
//     update: jest.fn(),
//     updateMany: jest.fn(),
//   },
//   refreshToken: {
//     create: jest.fn(),
//     findUnique: jest.fn(),
//     update: jest.fn(),
//     updateMany: jest.fn(),
//   },
// };

// jest.unstable_mockModule("../../src/prismaClient.js", () => ({
//   // PrismaClient: jest.fn().mockImplementation(() => mockePrisma)
//   prisma: mockePrisma,
// }));

// just.unstable_mockModule("bcrypt", () => ({
//   hash: jest.fn(),
//   compare: jest.fn(),
// }));

// const mockJwt = {
//   sign: jest.fn(),
//   verify: jest.fn(),
// };

// jest.unstable_mockModule("jsonwebtoken", () => ({
//   default: mockJwt,
// }));

// jest.unstable_mockModule("express-validator", () => ({
//   validationResult: jest.fn(),
// }));

// jest.unstable_mockModule("../../src/utils/email.js", () => ({
//   sendVerificationEmail: jest.fn(),
//   sendPasswordResetEmail: jest.fn(),
// }));

// jest.unstable_mockModule("../../src/utils/estra.js", () => ({
//   comparePassword: jestt.fn(),
//   hashPassword: jest.fn(),
//   generateTokens: jest.fn(),
//   generateRandomToken: jest.fn(),
//   setTokenCookies: jest.fn(),
//   clearTokenCookies: jest.fn(),
// }));

// const bcrypt = await import("bcrypt");
// const jwt = await import("jsonwebtoken");
// const { validationResult } = await import("express-validator");
// const { sendVerificationEmail, sendPasswordResetEmail } =
//   await import("../../src/utils/email.js");
// const {
//   comparePassword,
//   hashPassword,
//   generateTokens,
//   generateRandomToken,
//   setTokenCookies,
//   clearTokenCookies,
// } = await import("../../src/utils/extra.js");

// const {
//   register,
//   login,
//   refresh,
//   logout,
//   verifyEmail,
//   forgotPassword,
//   resetPassword,
//   me,
//   resendVerification,
// } = await import("../../src/controllers/authController.js");






// describe("Auth controller", () => {
//     let req, res;

//     beforeEach(() => {
//         jest.clearAllMocks();
//         req = {
//             body: {},
//             params: {},
//             cookies: {},
//             user: {id: 'user111'},

//         };
//         res = {
//             status: jest.fn().mockReturnThis(),
//             json: jest.fn(),
//             cookie: jest.fn(),
//         };


//     })


//     describe("register", () => {
//         const validUserData={
//             email: "annyone123@gmail.com",
//             username: "testuser",
//             password: "testpassword",
//         };

//         beforeEach(() => {
//             req.body = validUserData;

            
//             validationResult.mockReturnValue({ isEmpty: () => true });
//         })
//     })
    
// })







// tests/unit/authController.test.js
import { jest } from "@jest/globals";

// --------------------------------------------------
// Mock all dependencies
// --------------------------------------------------

// Mock prisma
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

jest.unstable_mockModule("../../src/prismaClient.js", () => ({
  prisma: mockPrisma,
}));

// Mock bcrypt
jest.unstable_mockModule("bcrypt", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
const mockJwt = {
  sign: jest.fn(),
  verify: jest.fn(),
};

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: mockJwt,
}));

// Mock express-validator
jest.unstable_mockModule("express-validator", () => ({
  validationResult: jest.fn(),
}));

// Mock email utils
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  sendVerificationEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

// Mock extra utils
jest.unstable_mockModule("../../src/utils/extra.js", () => ({
  comparePassword: jest.fn(),
  hashPassword: jest.fn(),
  generateTokens: jest.fn(),
  generateRandomToken: jest.fn(),
  setTokenCookies: jest.fn(),
  clearTokenCookies: jest.fn(),
}));

// Import all mocked modules
const bcrypt = await import("bcrypt");
const jwt = await import("jsonwebtoken");
const { validationResult } = await import("express-validator");
const { sendVerificationEmail, sendPasswordResetEmail } = await import("../../src/utils/email.js");
const {
  comparePassword,
  hashPassword,
  generateTokens,
  generateRandomToken,
  setTokenCookies,
  clearTokenCookies,
} = await import("../../src/utils/extra.js");
const {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  me,
  resendVerification,
} = await import("../../src/controllers/authController.js");

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("Auth Controller", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup request object
    req = {
      body: {},
      params: {},
      headers: {
        "user-agent": "Mozilla/5.0 (test)",
      },
      ip: "127.0.0.1",
      connection: {
        remoteAddress: "127.0.0.1",
      },
      cookies: {},
      user: { id: "user-123" },
    };

    // Setup response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    // Setup default mock implementations
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn(),
    });

    hashPassword.mockResolvedValue("hashed-password-123");
    generateRandomToken.mockReturnValue("random-token-123");
    generateTokens.mockReturnValue({
      accessToken: "access-token-123",
      refreshToken: "refresh-token-123",
    });
    comparePassword.mockResolvedValue(true);
    setTokenCookies.mockReturnValue(undefined);
    clearTokenCookies.mockReturnValue(undefined);
    sendVerificationEmail.mockResolvedValue(undefined);
    sendPasswordResetEmail.mockResolvedValue(undefined);
    mockJwt.verify.mockReturnValue({ userId: "user-123" });
    mockJwt.sign.mockReturnValue("signed-token-123");
  });

  // ==============================================
  // REGISTER TESTS
  // ==============================================

  describe("register", () => {
    const validUserData = {
      email: "test@example.com",
      username: "testuser",
      password: "Test123456",
    };

    beforeEach(() => {
      req.body = validUserData;
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashed-password-123",
        isEmailVerified: false,
        emailVerificationToken: "random-token-123",
        emailVerificationExpires: new Date(),
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
    });

    describe("Successful Registration", () => {
      it("should register a new user successfully", async () => {
        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: expect.stringContaining("Account created successfully"),
          user: expect.objectContaining({
            id: "user-123",
            email: "test@example.com",
            username: "testuser",
            isEmailVerified: false,
          }),
        });
      });

      it("should convert email to lowercase", async () => {
        req.body.email = "Test@Example.COM";
        await register(req, res);

        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            email: "test@example.com",
          }),
        });
      });

      it("should convert username to lowercase", async () => {
        req.body.username = "TestUser";
        await register(req, res);

        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            username: "testuser",
          }),
        });
      });

      it("should hash the password", async () => {
        await register(req, res);

        expect(hashPassword).toHaveBeenCalledWith("Test123456");
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            passwordHash: "hashed-password-123",
          }),
        });
      });

      it("should generate email verification token", async () => {
        await register(req, res);

        expect(generateRandomToken).toHaveBeenCalled();
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            emailVerificationToken: "random-token-123",
          }),
        });
      });

      it("should set email verification expiry to 24 hours", async () => {
        const mockDate = new Date("2026-01-01T00:00:00Z");
        jest.useFakeTimers().setSystemTime(mockDate);

        await register(req, res);

        const expectedExpiry = new Date("2026-01-02T00:00:00Z");
        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            emailVerificationExpires: expectedExpiry,
          }),
        });

        jest.useRealTimers();
      });

      it("should create a default plant", async () => {
        await register(req, res);

        expect(mockPrisma.user.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            plants: {
              create: {},
            },
          }),
        });
      });

      it("should generate access and refresh tokens", async () => {
        await register(req, res);

        expect(generateTokens).toHaveBeenCalledWith("user-123");
        expect(setTokenCookies).toHaveBeenCalledWith(
          res,
          "access-token-123",
          "refresh-token-123"
        );
      });

      it("should store refresh token in database", async () => {
        await register(req, res);

        expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            token: "refresh-token-123",
            userId: "user-123",
            userAgent: "Mozilla/5.0 (test)",
            ipAddress: "127.0.0.1",
          }),
        });
      });

      it("should send verification email without awaiting", async () => {
        let emailResolved = false;
        sendVerificationEmail.mockImplementation(() => {
          return new Promise((resolve) => {
            setTimeout(() => {
              emailResolved = true;
              resolve();
            }, 1000);
          });
        });

        await register(req, res);
        expect(emailResolved).toBe(false);

        await new Promise((resolve) => setTimeout(resolve, 1100));
        expect(emailResolved).toBe(true);
      });

      it("should handle email sending errors without failing", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        sendVerificationEmail.mockRejectedValue(new Error("Email service down"));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Email send failed:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 if validation fails", async () => {
        validationResult.mockReturnValue({
          isEmpty: jest.fn().mockReturnValue(false),
          array: jest.fn().mockReturnValue([
            { path: "email", msg: "Please provide a valid email" },
          ]),
        });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          errors: [{ field: "email", message: "Please provide a valid email" }],
        });
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
      });
    });

    describe("Duplicate User Handling", () => {
      it("should return 409 if email already exists", async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          id: "existing-user",
          email: "test@example.com",
          username: "differentuser",
        });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Email already registered",
          message: "Email already registered",
        });
        expect(mockPrisma.user.create).not.toHaveBeenCalled();
      });

      it("should return 409 if username already exists", async () => {
        mockPrisma.user.findFirst.mockResolvedValue({
          id: "existing-user",
          email: "different@example.com",
          username: "testuser",
        });

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Username already taken",
          message: "Username already taken",
        });
      });

      it("should check for both email and username duplicates", async () => {
        await register(req, res);

        expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
          where: {
            OR: [{ email: "test@example.com" }, { username: "testuser" }],
          },
        });
      });
    });

    describe("Error Handling", () => {
      it("should return 500 if database check fails", async () => {
        mockPrisma.user.findFirst.mockRejectedValue(new Error("Database error"));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Internal server error",
          message: "Something went wrong. Please try again later.",
        });
      });

      it("should return 500 if user creation fails", async () => {
        mockPrisma.user.create.mockRejectedValue(new Error("Database error"));

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it("should log errors", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        mockPrisma.user.findFirst.mockRejectedValue(new Error("Database error"));

        await register(req, res);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Register error:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });
  });

  // ==============================================
  // LOGIN TESTS
  // ==============================================

  describe("login", () => {
    const validLoginData = {
      email: "test@example.com",
      password: "Test123456",
    };

    beforeEach(() => {
      req.body = validLoginData;
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashed-password-123",
        isEmailVerified: true,
      });
      mockPrisma.refreshToken.create.mockResolvedValue({});
      comparePassword.mockResolvedValue(true);
    });

    describe("Successful Login", () => {
      it("should login user successfully", async () => {
        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Welcome back! Login successful.",
          user: expect.objectContaining({
            id: "user-123",
            email: "test@example.com",
            username: "testuser",
            isEmailVerified: true,
          }),
        });
      });

      it("should convert email to lowercase", async () => {
        req.body.email = "Test@Example.COM";
        await login(req, res);

        expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
          where: { email: "test@example.com" },
        });
      });

      it("should compare password", async () => {
        await login(req, res);

        expect(comparePassword).toHaveBeenCalledWith(
          "Test123456",
          "hashed-password-123"
        );
      });

      it("should generate tokens", async () => {
        await login(req, res);

        expect(generateTokens).toHaveBeenCalledWith("user-123");
        expect(setTokenCookies).toHaveBeenCalled();
      });

      it("should store refresh token", async () => {
        await login(req, res);

        expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
      });
    });

    describe("Validation Errors", () => {
      it("should return 400 if validation fails", async () => {
        validationResult.mockReturnValue({
          isEmpty: jest.fn().mockReturnValue(false),
          array: jest.fn().mockReturnValue([
            { path: "email", msg: "Invalid email" },
          ]),
        });

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
      });
    });

    describe("Authentication Failures", () => {
      it("should return 401 if user not found", async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password. Please try again.",
        });
      });

      it("should return 401 if password is incorrect", async () => {
        comparePassword.mockResolvedValue(false);

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password. Please try again.",
        });
      });

      it("should return 403 if email not verified", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: "user-123",
          email: "test@example.com",
          username: "testuser",
          passwordHash: "hashed-password-123",
          isEmailVerified: false,
        });

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Email not verified",
          message: expect.stringContaining("Please verify your email"),
        });
      });

      it("should resend verification email if email not verified", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({
          id: "user-123",
          email: "test@example.com",
          username: "testuser",
          passwordHash: "hashed-password-123",
          isEmailVerified: false,
        });

        await login(req, res);

        expect(generateRandomToken).toHaveBeenCalled();
        expect(mockPrisma.user.update).toHaveBeenCalled();
        expect(sendVerificationEmail).toHaveBeenCalled();
      });
    });

    describe("Error Handling", () => {
      it("should return 500 on database error", async () => {
        mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it("should log errors", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

        await login(req, res);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Login error:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });
  });

  // ==============================================
  // REFRESH TESTS
  // ==============================================

  describe("refresh", () => {
    beforeEach(() => {
      req.cookies = { refreshToken: "valid-refresh-token" };
      mockJwt.verify.mockReturnValue({ userId: "user-123" });
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        id: "rt-123",
        token: "valid-refresh-token",
        userId: "user-123",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        user: {
          id: "user-123",
          email: "test@example.com",
          username: "testuser",
        },
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});
      generateTokens.mockReturnValue({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
      });
    });

    describe("Successful Refresh", () => {
      it("should refresh tokens successfully", async () => {
        await refresh(req, res);

        expect(res.json).toHaveBeenCalledWith({
          success: true,
          message: "Session refreshed successfully.",
        });
        expect(setTokenCookies).toHaveBeenCalled();
      });

      it("should verify refresh token", async () => {
        await refresh(req, res);

        expect(mockJwt.verify).toHaveBeenCalledWith(
          "valid-refresh-token",
          process.env.JWT_REFRESH_SECRET
        );
      });

      it("should check token in database", async () => {
        await refresh(req, res);

        expect(mockPrisma.refreshToken.findUnique).toHaveBeenCalledWith({
          where: { token: "valid-refresh-token" },
          include: { user: true },
        });
      });

      it("should revoke old refresh token", async () => {
        await refresh(req, res);

        expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith({
          where: { id: "rt-123" },
          data: { isRevoked: true },
        });
      });

      it("should create new refresh token", async () => {
        await refresh(req, res);

        expect(mockPrisma.refreshToken.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            token: "new-refresh-token",
            userId: "user-123",
          }),
        });
      });
    });

    describe("Refresh Token Errors", () => {
      it("should return 401 if no refresh token", async () => {
        req.cookies = {};

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Refresh token required",
          message: "Please login again.",
        });
      });

      it("should return 401 if token verification fails", async () => {
        mockJwt.verify.mockImplementation(() => {
          throw new Error("Invalid token");
        });

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Invalid or expired refresh token",
          message: "Session expired. Please login again.",
        });
      });

      it("should return 401 if token not found in database", async () => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue(null);

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Refresh token not found",
          message: "Please login again.",
        });
      });

      it("should return 401 if token is revoked", async () => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
          id: "rt-123",
          token: "valid-refresh-token",
          userId: "user-123",
          isRevoked: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          user: { id: "user-123" },
        });

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Token revoked",
          message: "Security violation detected. Please login again.",
        });
        expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
        expect(clearTokenCookies).toHaveBeenCalled();
      });

      it("should return 401 if token expired", async () => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
          id: "rt-123",
          token: "valid-refresh-token",
          userId: "user-123",
          isRevoked: false,
          expiresAt: new Date(Date.now() - 1000),
          user: { id: "user-123" },
        });

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "Refresh token expired",
          message: "Session expired. Please login again.",
        });
      });

      it("should return 401 if user not found", async () => {
        mockPrisma.refreshToken.findUnique.mockResolvedValue({
          id: "rt-123",
          token: "valid-refresh-token",
          userId: "user-123",
          isRevoked: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          user: null,
        });

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          success: false,
          error: "User not found",
          message: "User account not found. Please login again.",
        });
      });
    });

    describe("Error Handling", () => {
      it("should return 500 on database error", async () => {
        mockPrisma.refreshToken.findUnique.mockRejectedValue(
          new Error("Database error")
        );

        await refresh(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
      });

      it("should log errors", async () => {
        const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
        mockPrisma.refreshToken.findUnique.mockRejectedValue(
          new Error("Database error")
        );

        await refresh(req, res);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Refresh error:",
          expect.any(Error)
        );

        consoleErrorSpy.mockRestore();
      });
    });
  });

  // ==============================================
  // LOGOUT TESTS
  // ==============================================

  describe("logout", () => {
    beforeEach(() => {
      req.cookies = { refreshToken: "valid-refresh-token" };
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});
    });

    it("should logout user successfully", async () => {
      await logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully. See you soon!",
      });
      expect(clearTokenCookies).toHaveBeenCalled();
    });

    it("should revoke refresh token", async () => {
      await logout(req, res);

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: "valid-refresh-token" },
        data: { isRevoked: true },
      });
    });

    it("should handle missing refresh token", async () => {
      req.cookies = {};

      await logout(req, res);

      expect(mockPrisma.refreshToken.updateMany).not.toHaveBeenCalled();
      expect(clearTokenCookies).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Logged out successfully. See you soon!",
      });
    });

    it("should handle errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.refreshToken.updateMany.mockRejectedValue(
        new Error("Database error")
      );

      await logout(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Logout error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ==============================================
  // VERIFY EMAIL TESTS
  // ==============================================

  describe("verifyEmail", () => {
    beforeEach(() => {
      req.params = { token: "valid-verification-token" };
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: false,
        emailVerificationToken: "valid-verification-token",
      });
      mockPrisma.user.update.mockResolvedValue({});
    });

    it("should verify email successfully", async () => {
      await verifyEmail(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Email verified successfully! You can now login to your account.",
      });
    });

    it("should find user by verification token", async () => {
      await verifyEmail(req, res);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          emailVerificationToken: "valid-verification-token",
          emailVerificationExpires: {
            gt: expect.any(Date),
          },
        },
      });
    });

    it("should update user verification status", async () => {
      await verifyEmail(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });
    });

    it("should return 400 if token invalid or expired", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid or expired verification token",
        message: "The verification link is invalid or has expired. Please request a new one.",
      });
    });

    it("should handle errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.user.findFirst.mockRejectedValue(new Error("Database error"));

      await verifyEmail(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Verify email error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ==============================================
  // FORGOT PASSWORD TESTS
  // ==============================================

  describe("forgotPassword", () => {
    beforeEach(() => {
      req.body = { email: "test@example.com" };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
      });
      mockPrisma.user.update.mockResolvedValue({});
      generateRandomToken.mockReturnValue("reset-token-123");
    });

    it("should send password reset email", async () => {
      await forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent to your inbox.",
      });
      expect(sendPasswordResetEmail).toHaveBeenCalledWith(
        "test@example.com",
        "testuser",
        "reset-token-123"
      );
    });

    it("should generate reset token with 1 hour expiry", async () => {
      const mockDate = new Date("2024-01-01T00:00:00Z");
      jest.useFakeTimers().setSystemTime(mockDate);

      await forgotPassword(req, res);

      const expectedExpiry = new Date("2024-01-01T01:00:00Z");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          passwordResetToken: "reset-token-123",
          passwordResetExpires: expectedExpiry,
        },
      });

      jest.useRealTimers();
    });

    it("should not reveal if email exists for security", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { path: "email", msg: "Invalid email" },
        ]),
      });

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });

    it("should handle email sending errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      sendPasswordResetEmail.mockRejectedValue(new Error("Email service down"));

      await forgotPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Email send failed:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await forgotPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Forgot password error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ==============================================
  // RESET PASSWORD TESTS
  // ==============================================

  describe("resetPassword", () => {
    beforeEach(() => {
      req.params = { token: "valid-reset-token" };
      req.body = { password: "NewPassword123" };
      mockPrisma.user.findFirst.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "old-hash",
        passwordResetToken: "valid-reset-token",
        passwordResetExpires: new Date(Date.now() + 3600000),
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});
      hashPassword.mockResolvedValue("new-hash-123");
      clearTokenCookies.mockReturnValue(undefined);
    });

    it("should reset password successfully", async () => {
      await resetPassword(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Password reset successfully! Please login with your new password.",
      });
      expect(clearTokenCookies).toHaveBeenCalled();
    });

    it("should hash new password", async () => {
      await resetPassword(req, res);

      expect(hashPassword).toHaveBeenCalledWith("NewPassword123");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          passwordHash: "new-hash-123",
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
    });

    it("should revoke all refresh tokens for security", async () => {
      await resetPassword(req, res);

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        data: { isRevoked: true },
      });
    });

    it("should return 400 if validation fails", async () => {
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([
          { path: "password", msg: "Password too weak" },
        ]),
      });

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(mockPrisma.user.findFirst).not.toHaveBeenCalled();
    });

    it("should return 400 if token invalid or expired", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid or expired reset token",
        message: "The password reset link is invalid or has expired. Please request a new one.",
      });
    });

    it("should handle errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.user.findFirst.mockRejectedValue(new Error("Database error"));

      await resetPassword(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Reset password error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ==============================================
  // ME TESTS
  // ==============================================

  describe("me", () => {
    beforeEach(() => {
      req.cookies = { accessToken: "valid-access-token" };
      mockJwt.verify.mockReturnValue({ userId: "user-123" });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    it("should get current user successfully", async () => {
      await me(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User authenticated successfully",
        user: expect.objectContaining({
          id: "user-123",
          email: "test@example.com",
          username: "testuser",
          isEmailVerified: true,
        }),
      });
    });

    it("should verify access token", async () => {
      await me(req, res);

      expect(mockJwt.verify).toHaveBeenCalledWith(
        "valid-access-token",
        process.env.JWT_ACCESS_SECRET
      );
    });

    it("should fetch user from database", async () => {
      await me(req, res);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: "user-123" },
        select: {
          id: true,
          email: true,
          username: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });

    it("should return 401 if no access token", async () => {
      req.cookies = {};

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authenticated",
        message: "Please login to access this resource.",
      });
    });

    it("should return 401 if token expired", async () => {
      const error = new Error("Token expired");
      error.name = "TokenExpiredError";
      mockJwt.verify.mockImplementation(() => {
        throw error;
      });

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Token expired",
        message: "Session expired. Please refresh your session.",
      });
    });

    it("should return 401 if token invalid", async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Invalid token",
        message: "Invalid session. Please login again.",
      });
    });

    it("should return 401 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "User not found",
        message: "User account not found. Please login again.",
      });
    });

    it("should handle errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await me(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Me route error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  // ==============================================
  // RESEND VERIFICATION TESTS
  // ==============================================

  describe("resendVerification", () => {
    beforeEach(() => {
      req.user = { id: "user-123" };
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: false,
      });
      mockPrisma.user.update.mockResolvedValue({});
      generateRandomToken.mockReturnValue("new-verification-token");
    });

    it("should resend verification email successfully", async () => {
      await resendVerification(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Verification email sent successfully! Please check your inbox.",
      });
      expect(sendVerificationEmail).toHaveBeenCalledWith(
        "test@example.com",
        "testuser",
        "new-verification-token"
      );
    });

    it("should generate new verification token", async () => {
      await resendVerification(req, res);

      expect(generateRandomToken).toHaveBeenCalled();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-123" },
        data: {
          emailVerificationToken: "new-verification-token",
          emailVerificationExpires: expect.any(Date),
        },
      });
    });

    it("should return 401 if not authenticated", async () => {
      req.user = {};

      await resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Not authenticated",
        message: "Please login to request a new verification email.",
      });
    });

    it("should return 404 if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "User not found",
        message: "User account not found.",
      });
    });

    it("should return 400 if email already verified", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: true,
      });

      await resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: "Email already verified",
        message: "Your email is already verified.",
      });
    });

    it("should handle email sending errors gracefully", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      sendVerificationEmail.mockRejectedValue(new Error("Email service down"));

      await resendVerification(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Verification email sent successfully! Please check your inbox.",
      });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Email send failed:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it("should handle errors", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
      mockPrisma.user.findUnique.mockRejectedValue(new Error("Database error"));

      await resendVerification(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Resend verification error:",
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});