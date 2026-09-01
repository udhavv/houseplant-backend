import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {
  generateTokens,
  hashPassword,
  comparePassword,
  generateRandomToken,
  setTokenCookies,
  clearTokenCookies,
} from "../../src/utils/extra.js";

describe("Extra Utilities", () => {

  // ==================================================
  // generateTokens
  // ==================================================

  describe("generateTokens", () => {

    beforeEach(() => {
      process.env.JWT_ACCESS_SECRET =
        "test-access-secret";

      process.env.JWT_REFRESH_SECRET =
        "test-refresh-secret";

      process.env.JWT_ACCESS_EXPIRY = "15m";
      process.env.JWT_REFRESH_EXPIRY = "7d";
    });


    test("should generate access and refresh tokens", () => {
      const result = generateTokens("user123");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");

      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
    });


    test("access token should contain userId", () => {
      const { accessToken } =
        generateTokens("user123");

      const decoded = jwt.verify(
        accessToken,
        process.env.JWT_ACCESS_SECRET
      );

      expect(decoded.userId).toBe("user123");
    });


    test("refresh token should contain userId", () => {
      const { refreshToken } =
        generateTokens("user123");

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      expect(decoded.userId).toBe("user123");
    });


    test("should generate different access and refresh tokens", () => {
      const {
        accessToken,
        refreshToken,
      } = generateTokens("user123");

      expect(accessToken).not.toBe(refreshToken);
    });
  });


  // ==================================================
  // hashPassword
  // ==================================================

  describe("hashPassword", () => {

    test("should hash a password", async () => {
      const password = "Password123";

      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
    });


    test("should generate a bcrypt hash", async () => {
      const hash = await hashPassword(
        "Password123"
      );

      expect(hash.startsWith("$2")).toBe(true);
    });
  });


  // ==================================================
  // comparePassword
  // ==================================================

  describe("comparePassword", () => {

    test("should return true for correct password", async () => {
      const password = "Password123";

      const hash = await hashPassword(password);

      const result = await comparePassword(
        password,
        hash
      );

      expect(result).toBe(true);
    });


    test("should return false for incorrect password", async () => {
      const hash = await hashPassword(
        "Password123"
      );

      const result = await comparePassword(
        "WrongPassword123",
        hash
      );

      expect(result).toBe(false);
    });
  });


  // ==================================================
  // generateRandomToken
  // ==================================================

  describe("generateRandomToken", () => {

    test("should generate a random token", () => {
      const token = generateRandomToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
    });


    test("should generate a 64 character hexadecimal token", () => {
      const token = generateRandomToken();

      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[a-f0-9]+$/);
    });


    test("should generate different tokens", () => {
      const token1 = generateRandomToken();
      const token2 = generateRandomToken();

      expect(token1).not.toBe(token2);
    });
  });


  // ==================================================
  // setTokenCookies
  // ==================================================

  describe("setTokenCookies", () => {

    test("should set access and refresh token cookies", () => {
      const res = {
        cookie: jest.fn(),
      };

      setTokenCookies(
        res,
        "access-token",
        "refresh-token"
      );

      expect(res.cookie).toHaveBeenCalledTimes(2);

      expect(res.cookie).toHaveBeenNthCalledWith(
        1,
        "accessToken",
        "access-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );

      expect(res.cookie).toHaveBeenNthCalledWith(
        2,
        "refreshToken",
        "refresh-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "lax",
          path: "/",
        })
      );
    });
  });


  // ==================================================
  // clearTokenCookies
  // ==================================================

  describe("clearTokenCookies", () => {

    test("should clear access and refresh token cookies", () => {
      const res = {
        clearCookie: jest.fn(),
      };

      clearTokenCookies(res);

      expect(res.clearCookie)
        .toHaveBeenCalledTimes(2);

      expect(res.clearCookie)
        .toHaveBeenNthCalledWith(
          1,
          "accessToken"
        );

      expect(res.clearCookie)
        .toHaveBeenNthCalledWith(
          2,
          "refreshToken"
        );
    });
  });
});