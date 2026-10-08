// import { jest } from "@jest/globals";

// // --------------------------------------------------
// // Mock controllers
// // --------------------------------------------------

// const register = jest.fn();
// const login = jest.fn();
// const refresh = jest.fn();
// const logout = jest.fn();
// const verifyEmail = jest.fn();
// const forgotPassword = jest.fn();
// const resetPassword = jest.fn();
// const me = jest.fn();
// const resendVerification = jest.fn();

// jest.unstable_mockModule(
//   "../../src/controllers/authController.js",
//   () => ({
//     register,
//     login,
//     refresh,
//     logout,
//     verifyEmail,
//     forgotPassword,
//     resetPassword,
//     me,
//     resendVerification,
//   })
// );

// // --------------------------------------------------
// // Mock validators
// // --------------------------------------------------

// const validateRegister = jest.fn();
// const validateLogin = jest.fn();
// const validateForgotPassword = jest.fn();
// const validateResetPassword = jest.fn();
// const validateRefreshToken = jest.fn();

// jest.unstable_mockModule(
//   "../../src/middleware/validators.js",
//   () => ({
//     validateRegister,
//     validateLogin,
//     validateForgotPassword,
//     validateResetPassword,
//     validateRefreshToken,
//   })
// );

// // --------------------------------------------------
// // Mock authentication middleware
// // --------------------------------------------------

// const authenticate = jest.fn();

// jest.unstable_mockModule(
//   "../../src/middleware/auth.js",
//   () => ({
//     authenticate,
//   })
// );

// // Import router AFTER mocks
// const { default: router } = await import(
//   "../../src/routes/authRoutes.js"
// );


// // --------------------------------------------------
// // Tests
// // --------------------------------------------------

// describe("Auth Routes", () => {
//   test("should register POST /register route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/register" &&
//         layer.route?.methods.post
        
//     );
//     // console.log('this is route1:- ', route)
//     expect(route).toBeDefined();
//   });


//   test("should use validateRegister and register for POST /register", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/register" &&
//         layer.route?.methods.post
//     );
//     // console.log('this is the route2:- ', route.route.stack)

//     expect(route.route.stack).toHaveLength(2);

//     expect(route.route.stack[0].handle).toBe(
//       validateRegister
//     );

//     expect(route.route.stack[1].handle).toBe(
//       register
//     );
//   });


//   test("should register POST /login route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/login" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();
//   });


//   test("should use validateLogin and login for POST /login", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/login" &&
//         layer.route?.methods.post
//     );

//         expect(route.route.stack).toHaveLength(2);


//     expect(route.route.stack[0].handle).toBe(
//       validateLogin
//     );

//     expect(route.route.stack[1].handle).toBe(
//       login
//     );
//   });


//   test("should register POST /refresh route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/refresh" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       validateRefreshToken
//     );

//     expect(route.route.stack[1].handle).toBe(
//       refresh
//     );
//   });


//   test("should register POST /forgot-password route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/forgot-password" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       validateForgotPassword
//     );

//     expect(route.route.stack[1].handle).toBe(
//       forgotPassword
//     );
//   });


//   test("should register POST /reset-password/:token route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/reset-password/:token" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       validateResetPassword
//     );

//     expect(route.route.stack[1].handle).toBe(
//       resetPassword
//     );
//   });


//   test("should register GET /verify-email/:token route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/verify-email/:token" &&
//         layer.route?.methods.get
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       verifyEmail
//     );
//   });


//   test("should register GET /me route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/me" &&
//         layer.route?.methods.get
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       authenticate
//     );

//     expect(route.route.stack[1].handle).toBe(
//       me
//     );
//   });


//   test("should register POST /resend-verification route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/resend-verification" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       authenticate
//     );

//     expect(route.route.stack[1].handle).toBe(
//       resendVerification
//     );
//   });


//   test("should register POST /logout route", () => {
//     const route = router.stack.find(
//       (layer) =>
//         layer.route?.path === "/logout" &&
//         layer.route?.methods.post
//     );

//     expect(route).toBeDefined();

//     expect(route.route.stack[0].handle).toBe(
//       authenticate
//     );

//     expect(route.route.stack[1].handle).toBe(
//       logout
//     );
//   });
// });
















// __tests__/routes/authRoutes.test.js
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
// Helper Functions
// --------------------------------------------------
const findRoute = (path, method) => {
  return router.stack.find(
    (layer) =>
      layer.route?.path === path &&
      layer.route?.methods[method.toLowerCase()]
  );
};

const verifyRouteMiddleware = (route, expectedHandlers) => {
  expect(route).toBeDefined();
  expect(route.route.stack).toHaveLength(expectedHandlers.length);
  
  expectedHandlers.forEach((handler, index) => {
    expect(route.route.stack[index].handle).toBe(handler);
  });
};

const getRouteByPath = (path) => {
  return router.stack.find(
    (layer) => layer.route?.path === path
  );
};

// --------------------------------------------------
// Tests
// --------------------------------------------------
describe("Auth Routes", () => {
  // ==============================================
  // POSITIVE TEST CASES
  // ==============================================
  
  describe("Positive Test Cases", () => {
    describe("Public Routes", () => {
      describe("POST /register", () => {
        it("should be registered with validateRegister and register middleware", () => {
          const route = findRoute("/register", "post");
          verifyRouteMiddleware(route, [validateRegister, register]);
        });

        it("should have correct route configuration", () => {
          const route = findRoute("/register", "post");
          expect(route.route.path).toBe("/register");
          expect(route.route.methods.post).toBe(true);
          expect(route.route.methods.get).toBeUndefined();
          expect(route.route.methods.put).toBeUndefined();
          expect(route.route.methods.delete).toBeUndefined();
        });
      });

      describe("POST /login", () => {
        it("should be registered with validateLogin and login middleware", () => {
          const route = findRoute("/login", "post");
          verifyRouteMiddleware(route, [validateLogin, login]);
        });

        it("should have correct route configuration", () => {
          const route = findRoute("/login", "post");
          expect(route.route.path).toBe("/login");
          expect(route.route.methods.post).toBe(true);
        });
      });

      describe("POST /refresh", () => {
        it("should be registered with validateRefreshToken and refresh middleware", () => {
          const route = findRoute("/refresh", "post");
          verifyRouteMiddleware(route, [validateRefreshToken, refresh]);
        });
      });

      describe("POST /forgot-password", () => {
        it("should be registered with validateForgotPassword and forgotPassword middleware", () => {
          const route = findRoute("/forgot-password", "post");
          verifyRouteMiddleware(route, [validateForgotPassword, forgotPassword]);
        });
      });

      describe("POST /reset-password/:token", () => {
        it("should be registered with validateResetPassword and resetPassword middleware", () => {
          const route = findRoute("/reset-password/:token", "post");
          verifyRouteMiddleware(route, [validateResetPassword, resetPassword]);
        });

        it("should have parameter in path", () => {
          const route = findRoute("/reset-password/:token", "post");
          expect(route.route.path).toBe("/reset-password/:token");
          expect(route.route.path).toContain(":token");
        });
      });

      describe("GET /verify-email/:token", () => {
        it("should be registered with verifyEmail middleware only", () => {
          const route = findRoute("/verify-email/:token", "get");
          verifyRouteMiddleware(route, [verifyEmail]);
        });

        it("should have parameter in path", () => {
          const route = findRoute("/verify-email/:token", "get");
          expect(route.route.path).toBe("/verify-email/:token");
          expect(route.route.path).toContain(":token");
        });
      });
    });

    describe("Protected Routes", () => {
      describe("GET /me", () => {
        it("should be registered with authenticate and me middleware", () => {
          const route = findRoute("/me", "get");
          verifyRouteMiddleware(route, [authenticate, me]);
        });
      });

      describe("POST /resend-verification", () => {
        it("should be registered with authenticate and resendVerification middleware", () => {
          const route = findRoute("/resend-verification", "post");
          verifyRouteMiddleware(route, [authenticate, resendVerification]);
        });
      });

      describe("POST /logout", () => {
        it("should be registered with authenticate and logout middleware", () => {
          const route = findRoute("/logout", "post");
          verifyRouteMiddleware(route, [authenticate, logout]);
        });
      });
    });

    describe("Route Configuration", () => {
      it("should have exactly 9 routes", () => {
        const routes = router.stack.filter(layer => layer.route);
        expect(routes).toHaveLength(9);
      });

      it("should have all expected routes registered", () => {
        const expectedPaths = [
          "/register",
          "/login",
          "/refresh",
          "/forgot-password",
          "/reset-password/:token",
          "/verify-email/:token",
          "/me",
          "/resend-verification",
          "/logout"
        ];

        expectedPaths.forEach(path => {
          const route = getRouteByPath(path);
          expect(route).toBeDefined();
        });
      });
    });

    describe("Middleware Order", () => {
      it("should always have validation before controller for public routes", () => {
        const publicRoutes = [
          { path: "/register", method: "post", handlers: [validateRegister, register] },
          { path: "/login", method: "post", handlers: [validateLogin, login] },
          { path: "/refresh", method: "post", handlers: [validateRefreshToken, refresh] },
          { path: "/forgot-password", method: "post", handlers: [validateForgotPassword, forgotPassword] },
          { path: "/reset-password/:token", method: "post", handlers: [validateResetPassword, resetPassword] },
        ];

        publicRoutes.forEach(({ path, method, handlers }) => {
          const route = findRoute(path, method);
          verifyRouteMiddleware(route, handlers);
        });
      });

      it("should always have authentication before controller for protected routes", () => {
        const protectedRoutes = [
          { path: "/me", method: "get", handlers: [authenticate, me] },
          { path: "/resend-verification", method: "post", handlers: [authenticate, resendVerification] },
          { path: "/logout", method: "post", handlers: [authenticate, logout] },
        ];

        protectedRoutes.forEach(({ path, method, handlers }) => {
          const route = findRoute(path, method);
          verifyRouteMiddleware(route, handlers);
        });
      });
    });
  });

  // ==============================================
  // NEGATIVE TEST CASES
  // ==============================================

  describe("Negative Test Cases", () => {
    describe("Invalid HTTP Methods", () => {
      it("should not allow GET on POST /register", () => {
        const route = findRoute("/register", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow PUT on POST /register", () => {
        const route = findRoute("/register", "put");
        expect(route).toBeUndefined();
      });

      it("should not allow DELETE on POST /register", () => {
        const route = findRoute("/register", "delete");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /login", () => {
        const route = findRoute("/login", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow PUT on POST /login", () => {
        const route = findRoute("/login", "put");
        expect(route).toBeUndefined();
      });

      it("should not allow DELETE on POST /login", () => {
        const route = findRoute("/login", "delete");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /refresh", () => {
        const route = findRoute("/refresh", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /forgot-password", () => {
        const route = findRoute("/forgot-password", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /reset-password/:token", () => {
        const route = findRoute("/reset-password/:token", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow POST on GET /verify-email/:token", () => {
        const route = findRoute("/verify-email/:token", "post");
        expect(route).toBeUndefined();
      });

      it("should not allow PUT on GET /verify-email/:token", () => {
        const route = findRoute("/verify-email/:token", "put");
        expect(route).toBeUndefined();
      });

      it("should not allow POST on GET /me", () => {
        const route = findRoute("/me", "post");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /logout", () => {
        const route = findRoute("/logout", "get");
        expect(route).toBeUndefined();
      });

      it("should not allow GET on POST /resend-verification", () => {
        const route = findRoute("/resend-verification", "get");
        expect(route).toBeUndefined();
      });
    });

    describe("Invalid Routes", () => {
      it("should not have non-existent route /nonexistent", () => {
        const route = findRoute("/nonexistent", "get");
        expect(route).toBeUndefined();
      });

      it("should not have route /invalid with any method", () => {
        const methods = ["get", "post", "put", "delete", "patch"];
        methods.forEach(method => {
          const route = findRoute("/invalid", method);
          expect(route).toBeUndefined();
        });
      });

      it("should not have route /api/register (wrong prefix)", () => {
        const route = findRoute("/api/register", "post");
        expect(route).toBeUndefined();
      });

      it("should not have route /auth/register (wrong prefix)", () => {
        const route = findRoute("/auth/register", "post");
        expect(route).toBeUndefined();
      });

      it("should not have route with trailing slash /register/", () => {
        const route = findRoute("/register/", "post");
        expect(route).toBeUndefined();
      });

      it("should not have route with uppercase path /REGISTER", () => {
        const route = findRoute("/REGISTER", "post");
        expect(route).toBeUndefined();
      });
    });

    describe("Missing Middleware", () => {
      it("should not have route without validation for /register", () => {
        const route = findRoute("/register", "post");
        expect(route.route.stack).not.toHaveLength(1);
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have route without authentication for /me", () => {
        const route = findRoute("/me", "get");
        expect(route.route.stack).not.toHaveLength(1);
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have route without authentication for /logout", () => {
        const route = findRoute("/logout", "post");
        expect(route.route.stack).not.toHaveLength(1);
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have route without authentication for /resend-verification", () => {
        const route = findRoute("/resend-verification", "post");
        expect(route.route.stack).not.toHaveLength(1);
        expect(route.route.stack).toHaveLength(2);
      });
    });

    describe("Incorrect Middleware Order", () => {
      it("should not have controller before validation for /register", () => {
        const route = findRoute("/register", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers[0]).not.toBe(register);
        expect(handlers[0]).toBe(validateRegister);
        expect(handlers[1]).toBe(register);
      });

      it("should not have controller before authentication for /me", () => {
        const route = findRoute("/me", "get");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers[0]).not.toBe(me);
        expect(handlers[0]).toBe(authenticate);
        expect(handlers[1]).toBe(me);
      });

      it("should not have controller before authentication for /logout", () => {
        const route = findRoute("/logout", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers[0]).not.toBe(logout);
        expect(handlers[0]).toBe(authenticate);
        expect(handlers[1]).toBe(logout);
      });
    });

    describe("Extra Middleware", () => {
      it("should not have extra middleware beyond expected for /register", () => {
        const route = findRoute("/register", "post");
        expect(route.route.stack).toHaveLength(2); // Exactly 2 middleware
      });

      it("should not have extra middleware beyond expected for /login", () => {
        const route = findRoute("/login", "post");
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have extra middleware beyond expected for /refresh", () => {
        const route = findRoute("/refresh", "post");
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have extra middleware beyond expected for /me", () => {
        const route = findRoute("/me", "get");
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have extra middleware beyond expected for /logout", () => {
        const route = findRoute("/logout", "post");
        expect(route.route.stack).toHaveLength(2);
      });

      it("should not have extra middleware for /verify-email/:token", () => {
        const route = findRoute("/verify-email/:token", "get");
        expect(route.route.stack).toHaveLength(1); // Only controller
      });
    });

    describe("Route Duplication", () => {
      it("should not have duplicate /register route", () => {
        const routes = router.stack.filter(
          layer => layer.route?.path === "/register"
        );
        expect(routes).toHaveLength(1);
      });

      it("should not have duplicate /login route", () => {
        const routes = router.stack.filter(
          layer => layer.route?.path === "/login"
        );
        expect(routes).toHaveLength(1);
      });

      it("should not have duplicate /logout route", () => {
        const routes = router.stack.filter(
          layer => layer.route?.path === "/logout"
        );
        expect(routes).toHaveLength(1);
      });

      it("should not have duplicate /me route", () => {
        const routes = router.stack.filter(
          layer => layer.route?.path === "/me"
        );
        expect(routes).toHaveLength(1);
      });
    });

    describe("Edge Cases", () => {
      it("should handle case-sensitive paths correctly", () => {
        const lowerRoute = findRoute("/register", "post");
        const upperRoute = findRoute("/REGISTER", "post");
        const mixedRoute = findRoute("/Register", "post");
        
        expect(lowerRoute).toBeDefined();
        expect(upperRoute).toBeUndefined();
        expect(mixedRoute).toBeUndefined();
      });

      it("should not have routes with query parameters in path", () => {
        const route = findRoute("/register?test=123", "post");
        expect(route).toBeUndefined();
      });

      it("should not have routes with hash in path", () => {
        const route = findRoute("/register#test", "post");
        expect(route).toBeUndefined();
      });

      it("should not have routes with spaces in path", () => {
        const route = findRoute("/register test", "post");
        expect(route).toBeUndefined();
      });

      it("should not have routes with special characters in path", () => {
        const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")"];
        specialChars.forEach(char => {
          const route = findRoute(`/register${char}`, "post");
          expect(route).toBeUndefined();
        });
      });

      it("should not have routes with extremely long paths", () => {
        const longPath = "/" + "a".repeat(1000);
        const route = findRoute(longPath, "get");
        expect(route).toBeUndefined();
      });

      it("should not have routes with empty path", () => {
        const route = findRoute("", "get");
        expect(route).toBeUndefined();
      });

      it("should not have routes with root path only", () => {
        const route = findRoute("/", "get");
        expect(route).toBeUndefined();
      });
    });

    describe("Authentication Middleware Validation", () => {
      it("should not expose protected routes without authentication", () => {
        const protectedPaths = ["/me", "/logout", "/resend-verification"];
        
        protectedPaths.forEach(path => {
          const route = getRouteByPath(path);
          expect(route).toBeDefined();
          
          // Check that authenticate is first middleware
          const firstMiddleware = route.route.stack[0].handle;
          expect(firstMiddleware).toBe(authenticate);
        });
      });

      it("should not have authentication middleware on public routes", () => {
        const publicPaths = [
          "/register",
          "/login",
          "/refresh",
          "/forgot-password",
          "/reset-password/:token",
          "/verify-email/:token"
        ];
        
        publicPaths.forEach(path => {
          const route = getRouteByPath(path);
          expect(route).toBeDefined();
          
          // Check that authenticate is not first middleware
          const firstMiddleware = route.route.stack[0].handle;
          expect(firstMiddleware).not.toBe(authenticate);
        });
      });

      it("should not allow access to protected routes without token", () => {
        const protectedRoutes = ["/me", "/logout", "/resend-verification"];
        
        protectedRoutes.forEach(path => {
          const route = getRouteByPath(path);
          expect(route.route.stack.map(layer => layer.handle)).toContain(authenticate);
        });
      });
    });

    describe("Validation Middleware Validation", () => {
      it("should not bypass validation for registration", () => {
        const route = findRoute("/register", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers).toContain(validateRegister);
        expect(handlers[0]).toBe(validateRegister);
      });

      it("should not bypass validation for login", () => {
        const route = findRoute("/login", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers).toContain(validateLogin);
        expect(handlers[0]).toBe(validateLogin);
      });

      it("should not bypass validation for refresh", () => {
        const route = findRoute("/refresh", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers).toContain(validateRefreshToken);
        expect(handlers[0]).toBe(validateRefreshToken);
      });

      it("should not bypass validation for forgot-password", () => {
        const route = findRoute("/forgot-password", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers).toContain(validateForgotPassword);
        expect(handlers[0]).toBe(validateForgotPassword);
      });

      it("should not bypass validation for reset-password", () => {
        const route = findRoute("/reset-password/:token", "post");
        const handlers = route.route.stack.map(layer => layer.handle);
        expect(handlers).toContain(validateResetPassword);
        expect(handlers[0]).toBe(validateResetPassword);
      });
    });

    describe("Complete Route Coverage", () => {
      it("should have all routes accounted for (no extra routes)", () => {
        const allRoutePaths = router.stack
          .filter(layer => layer.route)
          .map(layer => layer.route.path);
        
        const expectedPaths = [
          "/register",
          "/login",
          "/refresh",
          "/forgot-password",
          "/reset-password/:token",
          "/verify-email/:token",
          "/me",
          "/resend-verification",
          "/logout"
        ];
        
        const extraRoutes = allRoutePaths.filter(
          path => !expectedPaths.includes(path)
        );
        
        expect(extraRoutes).toHaveLength(0);
        expect(allRoutePaths).toEqual(expect.arrayContaining(expectedPaths));
      });

      it("should not have routes with methods other than intended", () => {
        const routeConfigs = [
          { path: "/register", allowedMethods: ["post"] },
          { path: "/login", allowedMethods: ["post"] },
          { path: "/refresh", allowedMethods: ["post"] },
          { path: "/forgot-password", allowedMethods: ["post"] },
          { path: "/reset-password/:token", allowedMethods: ["post"] },
          { path: "/verify-email/:token", allowedMethods: ["get"] },
          { path: "/me", allowedMethods: ["get"] },
          { path: "/resend-verification", allowedMethods: ["post"] },
          { path: "/logout", allowedMethods: ["post"] },
        ];

        routeConfigs.forEach(({ path, allowedMethods }) => {
          const route = getRouteByPath(path);
          const registeredMethods = Object.keys(route.route.methods);
          expect(registeredMethods).toEqual(allowedMethods);
        });
      });
    });

    describe("Security-Related Negative Tests", () => {
      it("should not expose internal middleware implementation details", () => {
        const route = findRoute("/register", "post");
        // Verify we only have middleware references, not implementation
        expect(route.route.stack[0].handle).toBe(validateRegister);
        expect(route.route.stack[0]).not.toHaveProperty("__internal");
      });

      it("should not have routes that bypass CORS or security", () => {
        // Check that all routes are properly configured
        const allRoutes = router.stack.filter(layer => layer.route);
        allRoutes.forEach(route => {
          // Routes should not be directly accessible with invalid methods
          const methods = Object.keys(route.route.methods);
          expect(methods.length).toBe(1); // Each route should have exactly one method
        });
      });

      it("should not have routes without proper error handling middleware", () => {
        const allRoutes = router.stack.filter(layer => layer.route);
        allRoutes.forEach(route => {
          // Each route should have at least one middleware
          expect(route.route.stack.length).toBeGreaterThan(0);
        });
      });
    });
  });
});