import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";


// --------------------------------------------------
// Mock Prisma
// --------------------------------------------------

const findUnique = jest.fn();

jest.unstable_mockModule(
  "../../src/prismaClient.js",
  () => ({
    prisma: {
      user: {
        findUnique,
      },
    },
  })
);


// --------------------------------------------------
// Import middleware AFTER mocks
// --------------------------------------------------

const {
  authenticate,
  optionalAuth,
} = await import(
  "../../src/middleware/auth.js"
);


// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("Authentication Middleware", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.JWT_ACCESS_SECRET =
      "test-access-secret";
  });


  // ==================================================
  // authenticate
  // ==================================================

  describe("authenticate", () => {

    test("should return 401 when no token is provided", async () => {

      const req = {
        cookies: {},
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(401);

      expect(res.json)
        .toHaveBeenCalledWith({
          error:
            "Authentication required. Please provide a valid access token.",
        });

      expect(next).not.toHaveBeenCalled();
    });


    test("should authenticate using access token from cookie", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      const user = {
        id: "user123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: true,
        createdAt: new Date(),
      };

      findUnique.mockResolvedValue(user);

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(findUnique)
        .toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              id: "user123",
            },
          })
        );

      expect(req.user).toEqual(user);
      expect(req.userId).toBe("user123");

      expect(next).toHaveBeenCalled();
    });


    test("should authenticate using Bearer token", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      const user = {
        id: "user123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: true,
        createdAt: new Date(),
      };

      findUnique.mockResolvedValue(user);

      const req = {
        cookies: {},
        headers: {
          authorization: `Bearer ${token}`,
        },
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(req.userId).toBe("user123");

      expect(next).toHaveBeenCalled();
    });


    test("should prefer cookie token over Authorization header", async () => {

      const cookieToken = jwt.sign(
        { userId: "cookie-user" },
        process.env.JWT_ACCESS_SECRET
      );

      const headerToken = jwt.sign(
        { userId: "header-user" },
        process.env.JWT_ACCESS_SECRET
      );

      findUnique.mockResolvedValue({
        id: "cookie-user",
        email: "cookie@example.com",
        username: "cookieuser",
        isEmailVerified: true,
        createdAt: new Date(),
      });

      const req = {
        cookies: {
          accessToken: cookieToken,
        },
        headers: {
          authorization: `Bearer ${headerToken}`,
        },
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(req.userId)
        .toBe("cookie-user");
    });


    test("should return 401 for invalid token", async () => {

      const req = {
        cookies: {
          accessToken: "invalid-token",
        },
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(401);

      expect(res.json)
        .toHaveBeenCalledWith({
          error:
            "Invalid access token. Please login again.",
        });

      expect(next).not.toHaveBeenCalled();
    });


    test("should return 401 for expired token", async () => {

      const expiredToken = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: -1 }
      );

      const req = {
        cookies: {
          accessToken: expiredToken,
        },
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(401);

      expect(res.json)
        .toHaveBeenCalledWith({
          error:
            "Access token expired. Please refresh your token.",
          code: "TOKEN_EXPIRED",
        });
    });


    test("should return 401 when user does not exist", async () => {

      const token = jwt.sign(
        { userId: "missing-user" },
        process.env.JWT_ACCESS_SECRET
      );

      findUnique.mockResolvedValue(null);

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(401);

      expect(res.json)
        .toHaveBeenCalledWith({
          error:
            "User not found. Please login again.",
        });
    });


    test("should return 403 when email is not verified", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      findUnique.mockResolvedValue({
        id: "user123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: false,
        createdAt: new Date(),
      });

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
        path: "/dashboard",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(403);

      expect(res.json)
        .toHaveBeenCalledWith({
          error:
            "Please verify your email before proceeding.",
          code: "EMAIL_NOT_VERIFIED",
        });

      expect(next).not.toHaveBeenCalled();
    });


    test("should allow unverified user on verify-email path", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      const user = {
        id: "user123",
        email: "test@example.com",
        username: "testuser",
        isEmailVerified: false,
        createdAt: new Date(),
      };

      findUnique.mockResolvedValue(user);

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
        path: "/verify-email/token123",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(req.user).toEqual(user);
      expect(req.userId).toBe("user123");

      expect(next).toHaveBeenCalled();
    });


    test("should return 500 when database throws an error", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      findUnique.mockRejectedValue(
        new Error("Database connection failed")
      );

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
        path: "/test",
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const next = jest.fn();

      await authenticate(req, res, next);

      expect(res.status)
        .toHaveBeenCalledWith(500);

      expect(res.json)
        .toHaveBeenCalledWith({
          error: "Internal server error",
        });
    });
  });


  // ==================================================
  // optionalAuth
  // ==================================================

  describe("optionalAuth", () => {

    test("should continue when no token is provided", async () => {

      const req = {
        cookies: {},
        headers: {},
      };

      const res = {};

      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();

      expect(req.user).toBeUndefined();
      expect(req.userId).toBeUndefined();
    });


    test("should attach user when valid token is provided", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      const user = {
        id: "user123",
        email: "test@example.com",
        username: "testuser",
      };

      findUnique.mockResolvedValue(user);

      const req = {
        cookies: {
          accessToken: token,
        },
        headers: {},
      };

      const res = {};

      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(req.user).toEqual(user);
      expect(req.userId).toBe("user123");

      expect(next).toHaveBeenCalled();
    });


    test("should continue when invalid token is provided", async () => {

      const req = {
        cookies: {
          accessToken: "invalid-token",
        },
        headers: {},
      };

      const res = {};

      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(next).toHaveBeenCalled();

      expect(req.user).toBeUndefined();
      expect(req.userId).toBeUndefined();
    });


    test("should use Authorization header when cookie is absent", async () => {

      const token = jwt.sign(
        { userId: "user123" },
        process.env.JWT_ACCESS_SECRET
      );

      const user = {
        id: "user123",
        email: "test@example.com",
        username: "testuser",
      };

      findUnique.mockResolvedValue(user);

      const req = {
        cookies: {},
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const res = {};

      const next = jest.fn();

      await optionalAuth(req, res, next);

      expect(req.userId).toBe("user123");
      expect(next).toHaveBeenCalled();
    });
  });
});