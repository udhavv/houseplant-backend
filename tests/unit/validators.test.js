import { jest } from "@jest/globals";
import {
  validationResult,
  matchedData,
} from "express-validator";

import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken,
} from "../../src/middleware/validators.js";

import {
  validatePlantName,
  validateResetPlant,
  validateGetMilestones,
  validateGetCareLogs,
  validateCheckPlantStatus,
} from "../../src/middleware/plantValidator.js";

import {
  validateGetBalance,
  validateDailyCheckin,
  validateBuyPot,
} from "../../src/middleware/shopValidator.js";


// --------------------------------------------------
// Helper function
// --------------------------------------------------

const runValidation = async (validators, req) => {
  const res = {};

  const next = jest.fn();

  for (const validator of validators) {
    await validator(req, res, next);
  }

  return validationResult(req);
};


// ==================================================
// AUTH VALIDATORS
// ==================================================

describe("Auth Validators", () => {

  // ------------------------------------------------
  // validateRegister
  // ------------------------------------------------

  describe("validateRegister", () => {

    test("should accept valid registration data", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test_user",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(true);
    });


    test("should reject invalid email", async () => {
      const req = {
        body: {
          email: "invalid-email",
          username: "test_user",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);

      expect(
        errors.array().some(
          (error) =>
            error.msg === "Please provide a valid email"
        )
      ).toBe(true);
    });


    test("should reject username shorter than 3 characters", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "ab",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject username longer than 30 characters", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "a".repeat(31),
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject username with invalid characters", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test-user",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);

      expect(
        errors.array().some(
          (error) =>
            error.msg.includes(
              "Username can only contain"
            )
        )
      ).toBe(true);
    });


    test("should reject password shorter than 8 characters", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test_user",
          password: "Pass1",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject password without uppercase letter", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test_user",
          password: "password123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject password without lowercase letter", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test_user",
          password: "PASSWORD123",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject password without number", async () => {
      const req = {
        body: {
          email: "test@example.com",
          username: "test_user",
          password: "Password",
        },
      };

      const errors = await runValidation(
        validateRegister,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });
  });


  // ------------------------------------------------
  // validateLogin
  // ------------------------------------------------

  describe("validateLogin", () => {

    test("should accept valid login data", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateLogin,
        req
      );

      expect(errors.isEmpty()).toBe(true);
    });


    test("should reject invalid email", async () => {
      const req = {
        body: {
          email: "invalid-email",
          password: "Password123",
        },
      };

      const errors = await runValidation(
        validateLogin,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject missing password", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "",
        },
      };

      const errors = await runValidation(
        validateLogin,
        req
      );

      expect(errors.isEmpty()).toBe(false);

      expect(
        errors.array().some(
          (error) =>
            error.msg === "Password is required"
        )
      ).toBe(true);
    });
  });


  // ------------------------------------------------
  // validateForgotPassword
  // ------------------------------------------------

  describe("validateForgotPassword", () => {

    test("should accept valid email", async () => {
      const req = {
        body: {
          email: "test@example.com",
        },
      };

      const errors = await runValidation(
        validateForgotPassword,
        req
      );

      expect(errors.isEmpty()).toBe(true);
    });


    test("should reject invalid email", async () => {
      const req = {
        body: {
          email: "invalid-email",
        },
      };

      const errors = await runValidation(
        validateForgotPassword,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });
  });


  // ------------------------------------------------
  // validateResetPassword
  // ------------------------------------------------

  describe("validateResetPassword", () => {

    test("should accept matching passwords", async () => {
      const req = {
        body: {
          password: "Password123",
          confirmPassword: "Password123",
        },
      };

      const errors = await runValidation(
        validateResetPassword,
        req
      );

      expect(errors.isEmpty()).toBe(true);
    });


    test("should reject short password", async () => {
      const req = {
        body: {
          password: "Pass1",
          confirmPassword: "Pass1",
        },
      };

      const errors = await runValidation(
        validateResetPassword,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject mismatched passwords", async () => {
      const req = {
        body: {
          password: "Password123",
          confirmPassword: "Different123",
        },
      };

      const errors = await runValidation(
        validateResetPassword,
        req
      );

      expect(errors.isEmpty()).toBe(false);

      expect(
        errors.array().some(
          (error) =>
            error.msg === "Passwords do not match"
        )
      ).toBe(true);
    });
  });


  // ------------------------------------------------
  // validateRefreshToken
  // ------------------------------------------------

  describe("validateRefreshToken", () => {

    test("should reject missing refresh token", async () => {
      const req = {
        body: {
          refreshToken: "",
        },
      };

      const errors = await runValidation(
        validateRefreshToken,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should reject invalid refresh token", async () => {
      const req = {
        body: {
          refreshToken: "not-a-jwt",
        },
      };

      const errors = await runValidation(
        validateRefreshToken,
        req
      );

      expect(errors.isEmpty()).toBe(false);
    });


    test("should accept valid JWT refresh token", async () => {
      const req = {
        body: {
          refreshToken:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJ1c2VySWQiOiIxMjMifQ." +
            "signature",
        },
      };

      const errors = await runValidation(
        validateRefreshToken,
        req
      );

      expect(errors.isEmpty()).toBe(true);
    });
  });
});


// ==================================================
// PLANT VALIDATORS
// ==================================================

describe("Plant Validators", () => {

  test("validatePlantName should be exported", () => {
    expect(validatePlantName).toBeDefined();
    expect(Array.isArray(validatePlantName)).toBe(true);
  });


  test("validateResetPlant should be exported", () => {
    expect(validateResetPlant).toBeDefined();
    expect(Array.isArray(validateResetPlant)).toBe(true);
  });


  test("validateGetMilestones should be exported", () => {
    expect(validateGetMilestones).toBeDefined();
    expect(Array.isArray(validateGetMilestones)).toBe(true);
  });


  test("validateGetCareLogs should be exported", () => {
    expect(validateGetCareLogs).toBeDefined();
    expect(Array.isArray(validateGetCareLogs)).toBe(true);
  });


  test("validateCheckPlantStatus should be exported", () => {
    expect(validateCheckPlantStatus).toBeDefined();
    expect(Array.isArray(validateCheckPlantStatus)).toBe(true);
  });
});


// ==================================================
// SHOP VALIDATORS
// ==================================================

describe("Shop Validators", () => {

  test("validateGetBalance should be exported", () => {
    expect(validateGetBalance).toBeDefined();
    expect(Array.isArray(validateGetBalance)).toBe(true);
  });


  test("validateDailyCheckin should be exported", () => {
    expect(validateDailyCheckin).toBeDefined();
    expect(Array.isArray(validateDailyCheckin)).toBe(true);
  });


  test("validateBuyPot should be exported", () => {
    expect(validateBuyPot).toBeDefined();
    expect(Array.isArray(validateBuyPot)).toBe(true);
  });
});