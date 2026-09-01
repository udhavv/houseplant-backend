// import request from "supertest";
// import app from "../../src/app.js";

// describe("Application", () => {
//   test("GET /test should return success", async () => {
//     const response = await request(app)
//       .get("/test");

//     expect(response.statusCode).toBe(200);

//     expect(response.text).toBe(
//       "Test route is working"
//     );
//   });
// });


// request(app).get('/test')



import { jest } from "@jest/globals";
import request from "supertest";

// Mock auth routes
jest.unstable_mockModule(
  "../../src/routes/authRoutes.js",
  () => ({
    default: (req, res, next) => {
      next();
    },
  })
);

// Mock plant routes
jest.unstable_mockModule(
  "../../src/routes/plantRoutes.js",
  () => ({
    default: (req, res, next) => {
      next();
    },
  })
);

// Mock shop routes
jest.unstable_mockModule(
  "../../src/routes/shopRoutes.js",
  () => ({
    default: (req, res, next) => {
      next();
    },
  })
);

// Import app AFTER mocks
const { default: app } = await import(
  "../../src/app.js"
);


describe("Application", () => {

  test("GET /test should return success", async () => {
    const response = await request(app)
      .get("/test");

    expect(response.statusCode).toBe(200);

    expect(response.text).toBe(
      "Test route is working"
    );
  });


  test("unknown route should return 404", async () => {
    const response = await request(app)
      .get("/does-not-exist");

    expect(response.statusCode).toBe(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe("Not Found");
  });


  test("unknown POST route should return 404", async () => {
    const response = await request(app)
      .post("/does-not-exist");

    expect(response.statusCode).toBe(404);
    expect(response.body.success).toBe(false);
  });


  test("should include Helmet security headers", async () => {
    const response = await request(app)
      .get("/test");

    expect(
      response.headers["x-content-type-options"]
    ).toBeDefined();
  });
  

});