import { jest } from "@jest/globals";

// Mock Prisma
const mockFindMany = jest.fn();
const mockUpdate = jest.fn();

// Mock email
const mockSendWiltingEmail = jest.fn();

// Mock Prisma module BEFORE importing plantDegrader
jest.unstable_mockModule("../../src/prismaClient.js", () => ({
  prisma: {
    plant: {
      findMany: mockFindMany,
      update: mockUpdate,
    },
  },
}));

// Mock email module
jest.unstable_mockModule("../../src/utils/email.js", () => ({
  sendWiltingEmail: mockSendWiltingEmail,
}));

// Import AFTER mocks
const {
  degradePlantHealth,
} = await import("../../src/cron/plantDegrader.js");


describe("Plant Degrader Cron Job", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockFindMany.mockReset();
    mockUpdate.mockReset();
    mockSendWiltingEmail.mockReset();
  });


  test("should not decrease health when plant was watered within 6 hours", async () => {

    const lastWateredAt = new Date(
      Date.now() - 5 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-1",
        name: "Monstera",
        health: 100,
        isAlive: true,
        lastWateredAt,
        user: {
          email: "test@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    expect(mockFindMany).toHaveBeenCalledWith({
      where: {
        isAlive: true,
      },
      include: {
        user: true,
      },
    });

    expect(mockUpdate).not.toHaveBeenCalled();

    expect(mockSendWiltingEmail).not.toHaveBeenCalled();
  });


  test("should decrease health after more than 6 hours without watering", async () => {

    const lastWateredAt = new Date(
      Date.now() - 7 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-1",
        name: "Monstera",
        health: 100,
        isAlive: true,
        lastWateredAt,
        user: {
          email: "test@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        id: "plant-1",
      },
      data: {
        health: 90,
        isAlive: true,
      },
    });

    expect(mockSendWiltingEmail).not.toHaveBeenCalled();
  });


  test("should decrease health by 20 after more than 12 hours", async () => {

    const lastWateredAt = new Date(
      Date.now() - 13 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-2",
        name: "Rose",
        health: 100,
        isAlive: true,
        lastWateredAt,
        user: {
          email: "rose@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        id: "plant-2",
      },
      data: {
        health: 80,
        isAlive: true,
      },
    });
  });


  test("should send wilting email when health drops below 30", async () => {

    const lastWateredAt = new Date(
      Date.now() - 7 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-3",
        name: "Fern",
        health: 35,
        isAlive: true,
        lastWateredAt,
        user: {
          email: "fern@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    // 35 - 10 = 25
    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        id: "plant-3",
      },
      data: {
        health: 25,
        isAlive: true,
      },
    });

    expect(mockSendWiltingEmail).toHaveBeenCalledWith(
      "fern@example.com",
      "Fern"
    );
  });


  test("should mark plant as dead when health reaches zero", async () => {

    const lastWateredAt = new Date(
      Date.now() - 13 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-4",
        name: "Cactus",
        health: 10,
        isAlive: true,
        lastWateredAt,
        user: {
          email: "cactus@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    // 10 - 20 = -10
    // Math.max(0, -10) = 0

    expect(mockUpdate).toHaveBeenCalledWith({
      where: {
        id: "plant-4",
      },
      data: {
        health: 0,
        isAlive: false,
      },
    });

    // Dead plants should not receive wilting email
    expect(mockSendWiltingEmail).not.toHaveBeenCalled();
  });


  test("should handle multiple plants", async () => {

    const sevenHoursAgo = new Date(
      Date.now() - 7 * 60 * 60 * 1000
    );

    mockFindMany.mockResolvedValue([
      {
        id: "plant-1",
        name: "Monstera",
        health: 100,
        isAlive: true,
        lastWateredAt: sevenHoursAgo,
        user: {
          email: "one@example.com",
        },
      },
      {
        id: "plant-2",
        name: "Rose",
        health: 80,
        isAlive: true,
        lastWateredAt: sevenHoursAgo,
        user: {
          email: "two@example.com",
        },
      },
    ]);

    await degradePlantHealth();

    expect(mockUpdate).toHaveBeenCalledTimes(2);

    expect(mockUpdate).toHaveBeenNthCalledWith(1, {
      where: {
        id: "plant-1",
      },
      data: {
        health: 90,
        isAlive: true,
      },
    });

    expect(mockUpdate).toHaveBeenNthCalledWith(2, {
      where: {
        id: "plant-2",
      },
      data: {
        health: 70,
        isAlive: true,
      },
    });
  });


  test("should handle database errors", async () => {

    const databaseError = new Error(
      "Database connection failed"
    );

    mockFindMany.mockRejectedValue(databaseError);

    await expect(
      degradePlantHealth()
    ).rejects.toThrow("Database connection failed");

    expect(mockUpdate).not.toHaveBeenCalled();

    expect(mockSendWiltingEmail).not.toHaveBeenCalled();
  });

});