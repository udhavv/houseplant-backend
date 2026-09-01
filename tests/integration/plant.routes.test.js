import { expect, jest } from "@jest/globals";

const fetchPlantState = jest.fn();
const waterPlant = jest.fn();
const fertilizePlant = jest.fn();
const repotPlant = jest.fn();
const resetPlant = jest.fn();
const getPlantMilestones = jest.fn();
const getPlantCareLogs = jest.fn();
const updatePlantName = jest.fn();
const checkPlantStatus = jest.fn();
const prunePlant = jest.fn();

jest.unstable_mockModule(
    "../../src/controllers/plantController.js",
     () => ({
  fetchPlantState,
  waterPlant,
  fertilizePlant,
  repotPlant,
  resetPlant,
  getPlantMilestones,
  getPlantCareLogs,
  updatePlantName,
  checkPlantStatus,
  prunePlant,
}));


const validatePlantName= jest.fn();
const validateResetPlant= jest.fn();
const validateGetMilestones= jest.fn();
const validateGetCareLogs= jest.fn();
const validateCheckPlantStatus= jest.fn();

jest.unstable_mockModule(
    "../../src/middleware/plantValidator.js",
    () => (({
        validatePlantName,
  validateResetPlant,
  validateGetMilestones,
  validateGetCareLogs,
  validateCheckPlantStatus
    }))
)






const authenticate = jest.fn();


jest.unstable_mockModule("../../src/middleware/auth.js", () => ({
  authenticate,
}));



const { default: router } = await import(
    "../../src/routes/plantRoutes.js"
);

// test begins
describe("Plant Routes", () => {
  test("shouuld registeer /state route", () => {
    const route = router.stack.find(
      (layer) => 
        layer.route?.path === "/state" && 
        layer.route?.methods.get,
    );

    expect(route).toBeDefined();
  });

  test("should register GET /state", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/state' &&
            layer.route?.methods.get
    );

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        fetchPlantState
    );
  })

  test("shoule register GET /status route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path==='/status' &&
        layer.route?.methods.get
    )

    expect(route).toBeDefined();
  })


  test("shoule use validadteeCheckPlantStatus", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== "/status" &&
        layer.route?.methods.get
    );

    expect(route.route.stack).toHaveLength(2);

    expect(route.route.stack[0].handle).toBe(
        validateCheckPlantStatus
    )

    expect(route.route.stack[1].handle).toBe(
        checkPlantStatus
    )
  }) 


  test("should water POST /water route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/water' &&
        layer.route?.methods.post
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        waterPlant
    )
  })






   test("should fertilize POST /fertilize route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/fertilize' &&
        layer.route?.methods.post
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        fertilizePlant
    )
  })


  test("should prune POST /prune route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/prune' &&
        layer.route?.methods.post
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        prunePlant
    )
  })



  test("should repot POST /repot route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/repot' &&
        layer.route?.methods.post
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        repotPlant
    )
  })


  test("should reset POST /reset route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/reset' &&
        layer.route?.methods.post
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        validateResetPlant
    )
     expect(route.route.stack[1].handle).toBe(
        resetPlant
    )
  })

   test("should name PUT /name route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/name' &&
        layer.route?.methods.put
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        validatePlantName
    )
     expect(route.route.stack[1].handle).toBe(
        updatePlantName
    )
  })



  
   test("should milestones GET /milestones route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/milestones' &&
        layer.route?.methods.get
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        validateGetMilestones
    )
     expect(route.route.stack[1].handle).toBe(
        getPlantMilestones
    )
  })



     test("should care logs GET /care-logs route", () => {
    const route= router.stack.find(
        (layer) => 
            layer.route?.path=== '/care-logs' &&
        layer.route?.methods.get
    )

    expect(route).toBeDefined();

    expect(route.route.stack[0].handle).toBe(
        validateGetCareLogs
    )
     expect(route.route.stack[1].handle).toBe(
        getPlantCareLogs
    )
  })



});
