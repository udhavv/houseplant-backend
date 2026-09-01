import { jest } from "@jest/globals";

// --------------------------------------------------
// Mock controllers
// --------------------------------------------------

const register = jest.fn();
const login = jest.fn();
const refresh = jest.fn();
const logout = jest.fn();
const verifyEmail = jest.fn();
const forgotPassword = jest.fn();
const resetPassword = jest.fn();
const me = jest.fn();
const resendVerification = jest.fn();

jest.unstable_mockModule(
  "../../src/controllers/authController.js",
  () => ({
    register,
    login,
    refresh,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    me,
    resendVerification,
  })
);

// --------------------------------------------------
// Mock validators
// --------------------------------------------------

const validateRegister = jest.fn();
const validateLogin = jest.fn();
const validateForgotPassword = jest.fn();
const validateResetPassword = jest.fn();
const validateRefreshToken = jest.fn();

jest.unstable_mockModule(
  "../../src/middleware/validators.js",
  () => ({
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateRefreshToken,
  })
);

// --------------------------------------------------
// Mock authentication middleware
// --------------------------------------------------

const authenticate = jest.fn();

jest.unstable_mockModule(
  "../../src/middleware/auth.js",
  () => ({
    authenticate,
  })
);

// Import router AFTER mocks
const { default: router } = await import(
  "../../src/routes/authRoutes.js"
);


// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("Auth Routes", () => {
  test("should register POST /register route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/register" &&
        layer.route?.methods.post
        
    );
    // console.log('this is route1:- ', route)
    expect(route).toBeDefined();
  });


  test("should use validateRegister and register for POST /register", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/register" &&
        layer.route?.methods.post
    );
    // console.log('this is the route2:- ', route.route.stack)

    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(
      validateRegister
    );

    expect(route.route.stack[1].handle).toBe(
      register
    );
  });


  test("should register POST /login route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/login" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();
  });


  test("should use validateLogin and login for POST /login", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/login" &&
        layer.route?.methods.post
    );

    expect(route.route.stack[0].handle).toBe(
      validateLogin
    );

    expect(route.route.stack[1].handle).toBe(
      login
    );
  });


  test("should register POST /refresh route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/refresh" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      validateRefreshToken
    );

    expect(route.route.stack[1].handle).toBe(
      refresh
    );
  });


  test("should register POST /forgot-password route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/forgot-password" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      validateForgotPassword
    );

    expect(route.route.stack[1].handle).toBe(
      forgotPassword
    );
  });


  test("should register POST /reset-password/:token route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/reset-password/:token" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      validateResetPassword
    );

    expect(route.route.stack[1].handle).toBe(
      resetPassword
    );
  });


  test("should register GET /verify-email/:token route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/verify-email/:token" &&
        layer.route?.methods.get
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      verifyEmail
    );
  });


  test("should register GET /me route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/me" &&
        layer.route?.methods.get
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      authenticate
    );

    expect(route.route.stack[1].handle).toBe(
      me
    );
  });


  test("should register POST /resend-verfication route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/resend-verfication" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      authenticate
    );

    expect(route.route.stack[1].handle).toBe(
      resendVerification
    );
  });


  test("should register POST /logout route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/logout" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
      authenticate
    );

    expect(route.route.stack[1].handle).toBe(
      logout
    );
  });
});