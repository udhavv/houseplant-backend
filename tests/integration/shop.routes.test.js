// tests/unit/shopRoutes.test.js

import { jest } from "@jest/globals";

// --------------------------------------------------
// Mock controllers
// --------------------------------------------------

const getUserBalance = jest.fn();
const dailyCheckin = jest.fn();
const buyPot = jest.fn();

jest.unstable_mockModule(
  "../../src/controllers/shopController.js",
  () => ({
    getUserBalance,
    dailyCheckin,
    buyPot,
  })
);

// --------------------------------------------------
// Mock shop validators
// --------------------------------------------------

const validateGetBalance = jest.fn();
const validateDailyCheckin = jest.fn();
const validateBuyPot = jest.fn();

jest.unstable_mockModule(
  "../../src/middleware/shopValidator.js",
  () => ({
    validateGetBalance,
    validateDailyCheckin,
    validateBuyPot,
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

// --------------------------------------------------
// Import router AFTER mocks
// --------------------------------------------------

const { default: router } = await import(
  "../../src/routes/shopRoutes.js"
);

// --------------------------------------------------
// Tests
// --------------------------------------------------

describe("Shop Routes", () => {

  test("should register authentication middleware", () => {
    const middleware = router.stack.find(
      (layer) =>
        !layer.route &&
        layer.handle === authenticate
    );

    expect(middleware).toBeDefined();
  });


  test("should register GET /balance route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/balance" &&
        layer.route?.methods.get
    );

    expect(route).toBeDefined();

    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(
      validateGetBalance
    );

    expect(route.route.stack[1].handle).toBe(
      getUserBalance
    );
  });


  test("should register POST /checkin route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/checkin" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(
      validateDailyCheckin
    );

    expect(route.route.stack[1].handle).toBe(
      dailyCheckin
    );
  });


  test("should register POST /buy-pot route", () => {
    const route = router.stack.find(
      (layer) =>
        layer.route?.path === "/buy-pot" &&
        layer.route?.methods.post
    );

    expect(route).toBeDefined();

    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(
      validateBuyPot
    );

    expect(route.route.stack[1].handle).toBe(
      buyPot
    );
  });

});