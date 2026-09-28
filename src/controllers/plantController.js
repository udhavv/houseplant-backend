// // controllers/plantController.js
// import { prisma } from "../prismaClient.js";
// import {
//   PLANT_STAGES,
//   EXPERIENCE_REWARDS,
//   COIN_REWARDS,
// } from "../utils/constants.js";

// // Helper: Get current stage based on health and days
// const getCurrentStage = (health, daysOld, experience) => {
//   const stages = Object.values(PLANT_STAGES);

//   let currentStage = stages[0]; // Default to SEED

//   for (const stage of stages) {
//     if (
//       health >= stage.healthRange[0] &&
//       daysOld >= stage.minDays &&
//       experience >= stage.experienceRequired
//     ) {
//       currentStage = stage;
//     }
//   }

//   return currentStage;
// };

// // Helper: Check if plant should advance to next stage
// const shouldAdvanceStage = (plant) => {
//   const stages = Object.values(PLANT_STAGES);
//   const currentIndex = stages.findIndex((s) => s.id === plant.growthStage);
//   const nextStage = stages[currentIndex + 1];

//   if (!nextStage) return false;

//   return (
//     plant.health >= nextStage.healthRange[0] &&
//     plant.daysOld >= nextStage.minDays &&
//     plant.experience >= nextStage.experienceRequired
//   );
// };

// // Helper: Calculate days old
// const calculateDaysOld = (createdAt) => {
//   return Math.floor(
//     (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24),
//   );
// };

// // Helper: Calculate XP required for next level
// const getXPRequiredForLevel = (level) => {
//   return level * 200; // Level 1: 200, Level 2: 400, Level 3: 600, etc.
// };

// // Helper: Check and handle level up
// const checkAndHandleLevelUp = async (plant, userId) => {
//   let leveledUp = false;
//   let currentPlant = plant;

//   while (true) {
//     const xpRequired = getXPRequiredForLevel(currentPlant.level);

//     if (currentPlant.experience < xpRequired) break;

//     // Level up!
//     currentPlant.level += 1;
//     currentPlant.experience -= xpRequired;
//     leveledUp = true;

//     const levelUpReward = EXPERIENCE_REWARDS.LEVEL_UP || 50;
//     const coinReward = COIN_REWARDS.LEVEL_UP || 50;

//     //  Atomic: update plant, user coins, transaction, milestone
//     await prisma.$transaction([
//       prisma.plant.update({
//         where: { id: currentPlant.id },
//         data: {
//           level: currentPlant.level,
//           experience: currentPlant.experience + levelUpReward,
//         },
//       }),
//       prisma.user.update({
//         where: { id: userId },
//         data: { coins: { increment: coinReward } },
//       }),
//       prisma.transaction.create({
//         data: {
//           amount: coinReward,
//           type: "level_up_bonus",
//           description: `Reached level ${currentPlant.level}!`,
//           userId,
//         },
//       }),
//       prisma.plantMilestone.create({
//         data: {
//           type: "level_up",
//           name: `Reached Level ${currentPlant.level}`,
//           description: `Your plant reached level ${currentPlant.level}!`,
//           icon: "⭐",
//           plantId: currentPlant.id,
//           userId,
//         },
//       }),
//     ]);
//   }

//   return { plant: currentPlant, leveledUp };
// };

// // Helper: Get or create plant for user
// const getOrCreatePlant = async (userId) => {
//   let plant = await prisma.plant.findFirst({
//     where: { userId },
//   });

//   if (!plant) {
//     plant = await prisma.plant.create({
//       data: {
//         userId,
//         name: "Sprout",
//         health: 100,
//         waterLevel: 100,
//         growthStage: "seed",
//         experience: 0,
//         level: 1,
//         daysOld: 0,
//         lastStageUpdate: new Date(),
//         lastWateredAt: new Date(),
//         isAlive: true,
//         potType: "basic",
//       },
//     });

//     await prisma.plantMilestone.create({
//       data: {
//         type: "new_plant",
//         name: "New Plant Sprouted",
//         description: "Started a new plant journey!",
//         icon: "🌱",
//         plantId: plant.id,
//         userId,
//       },
//     });
//   }

//   return plant;
// };

// // GET: Fetch current plant state
// export const fetchPlantState = async (req, res) => {
//   try {
//     const plant = await getOrCreatePlant(req.userId);
//     const daysOld = calculateDaysOld(plant.createdAt);

//     if (!plant.isAlive) {
//       return res.json({
//         success: true,
//         plant: { ...plant, daysOld },
//         message: "Plant is dead. Please reset to start a new one.",
//       });
//     }

//     await prisma.plant.update({
//       where: { id: plant.id },
//       data: { daysOld },
//     });

//     const currentStage = getCurrentStage(
//       plant.health,
//       daysOld,
//       plant.experience,
//     );

//     if (currentStage.id !== plant.growthStage) {
//       const stageAdvancementReward = EXPERIENCE_REWARDS.STAGE_ADVANCE;
//       const coinReward = COIN_REWARDS.STAGE_ADVANCE;

//       await prisma.$transaction([
//         prisma.plant.update({
//           where: { id: plant.id },
//           data: {
//             growthStage: currentStage.id,
//             lastStageUpdate: new Date(),
//             experience: { increment: stageAdvancementReward },
//           },
//         }),
//         prisma.transaction.create({
//           data: {
//             amount: coinReward,
//             type: "stage_bonus",
//             description: `Advanced to ${currentStage.label} stage!`,
//             userId: req.userId,
//           },
//         }),
//         //  Add this
//         prisma.user.update({
//           where: { id: req.userId },
//           data: { coins: { increment: coinReward } },
//         }),
//         prisma.plantMilestone.create({
//           data: {
//             type: "stage_reached",
//             name: `Reached ${currentStage.label} Stage`,
//             description: `Your plant has grown to the ${currentStage.label} stage!`,
//             icon: currentStage.icon,
//             plantId: plant.id,
//             userId: req.userId,
//           },
//         }),
//       ]);

//       const updatedPlant = await prisma.plant.findFirst({
//         where: { userId: req.userId },
//       });

//       // Check for level up after stage advancement
//       const levelResult = await checkAndHandleLevelUp(updatedPlant, req.userId);

//       return res.json({
//         success: true,
//         plant: levelResult.plant,
//         message: `🌱 Your plant reached ${currentStage.label} stage!`,
//         stageAdvancement: true,
//         leveledUp: levelResult.leveledUp,
//         rewards: {
//           experience: stageAdvancementReward,
//           coins: coinReward,
//         },
//       });
//     }

//     await prisma.plant.update({
//       where: { id: plant.id },
//       data: { daysOld },
//     });

//     const updatedPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     res.json({
//       success: true,
//       plant: updatedPlant,
//     });
//   } catch (error) {
//     console.error("Fetch plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to fetch plant data",
//     });
//   }
// };

// // POST: Water the plant
// export const waterPlant = async (req, res) => {
//   try {
//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.status(404).json({
//         success: false,
//         error: "Plant not found",
//         message: "You don't have a plant. Please create one first.",
//       });
//     }

//     if (!plant.isAlive) {
//       return res.status(400).json({
//         success: false,
//         error: "Plant is dead",
//         message: "💀 Your plant is dead. Please reset it to start a new one.",
//       });
//     }

//     // ====== FIX 1: Water cooldown - 5 minutes ======
//     const minutesSinceWatered =
//       (Date.now() - new Date(plant.lastWateredAt).getTime()) / (1000 * 60);
//     const COOLDOWN_MINUTES = 5;

//     if (minutesSinceWatered < COOLDOWN_MINUTES) {
//       // const remainingMinutes = Math.ceil(COOLDOWN_MINUTES - minutesSinceWatered)
//       return res.status(400).json({
//         success: false,
//         error: "Too soon to water",
//         message: `⏳ Please wait 5 minute(s) before watering again.`,
//       });
//     }

//     // Bonus: If watered within 1 hour of last watering, add bonus coins
//     const hoursSinceWatered = minutesSinceWatered / 60;
//     let bonusCoins = 0;
//     let bonusXP = 0;

//     if (hoursSinceWatered < 1) {
//       bonusCoins = COIN_REWARDS.WATER_BONUS || 5;
//       bonusXP = 5;
//     }

//     // Calculate new health
//     const healthIncrease = 10 + (plant.waterLevel < 50 ? 5 : 0);
//     const newHealth = Math.min(100, plant.health + healthIncrease);
//     const newWaterLevel = Math.min(100, plant.waterLevel + 20);

//     // Update plant
//     await prisma.plant.update({
//       where: { id: plant.id },
//       data: {
//         health: newHealth,
//         waterLevel: newWaterLevel,
//         lastWateredAt: new Date(),
//         experience: { increment: EXPERIENCE_REWARDS.WATER + bonusXP },
//       },
//     });
//     // console.log('this is the updatedplant data::- ', updatedPlant)

//     // Log the transaction
//     // Log the transaction and update user coins
//     await prisma.$transaction([
//       prisma.transaction.create({
//         data: {
//           amount: bonusCoins,
//           type: "water_bonus",
//           description:
//             bonusCoins > 0
//               ? "Consistency bonus for watering!"
//               : "Watered plant",
//           userId: req.userId,
//         },
//       }),
//       //  Only increment if bonusCoins > 0
//       ...(bonusCoins > 0
//         ? [
//             prisma.user.update({
//               where: { id: req.userId },
//               data: { coins: { increment: bonusCoins } },
//             }),
//           ]
//         : []),
//       prisma.plantCareLog.create({
//         data: {
//           action: "water",
//           details: bonusCoins > 0 ? "Watered with bonus!" : "Watered",
//           plantId: plant.id,
//           userId: req.userId,
//         },
//       }),
//     ]);

//     // Check for level up
//     const refreshedPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     const levelResult = await checkAndHandleLevelUp(refreshedPlant, req.userId);

//     // Check for stage advancement
//     const shouldAdvance = shouldAdvanceStage(levelResult.plant);
//     let stageAdvancementMessage = "";
//     let stageAdvanced = false;

//     if (shouldAdvance) {
//       const nextStage = getCurrentStage(
//         levelResult.plant.health,
//         levelResult.plant.daysOld,
//         levelResult.plant.experience,
//       );

//       await prisma.plant.update({
//         where: { id: plant.id },
//         data: {
//           growthStage: nextStage.id,
//           lastStageUpdate: new Date(),
//         },
//       });

//       stageAdvancementMessage = ` 🌱 Advanced to ${nextStage.label}!`;
//       stageAdvanced = true;
//     }

//     const finalPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     let message = `💧 Plant watered!`;
//     if (stageAdvanced) message += stageAdvancementMessage;
//     if (levelResult.leveledUp)
//       message += ` ⭐ Leveled up to ${finalPlant.level}!`;

//     res.json({
//       success: true,
//       plant: finalPlant,
//       bonusCoins,
//       bonusXP,
//       message,
//       stageAdvanced,
//       leveledUp: levelResult.leveledUp,
//     });
//   } catch (error) {
//     console.error("Water plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to water plant",
//     });
//   }
// };

// // POST: Fertilize plant
// export const fertilizePlant = async (req, res) => {
//   try {
//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.status(404).json({
//         success: false,
//         error: "Plant not found",
//         message: "You don't have a plant. Please create one first.",
//       });
//     }

//     if (!plant.isAlive) {
//       return res.status(400).json({
//         success: false,
//         error: "Plant is dead",
//         message: "💀 Your plant is dead. Please reset it to start a new one.",
//       });
//     }

//     // Check if fertilized recently (cooldown: 24 hours)
//     const lastFertilize = await prisma.plantCareLog.findFirst({
//       where: {
//         plantId: plant.id,
//         action: "fertilize",
//         timestamp: {
//           gt: new Date(Date.now() - 24 * 60 * 60 * 1000),
//         },
//       },
//     });

//     if (lastFertilize) {
//       const hoursRemaining = Math.ceil(
//         (24 * 60 * 60 * 1000 -
//           (Date.now() - new Date(lastFertilize.timestamp).getTime())) /
//           (1000 * 60 * 60),
//       );
//       return res.status(400).json({
//         success: false,
//         error: "Too soon to fertilize",
//         message: `⏳ Please wait ${hoursRemaining} hour(s) before fertilizing again.`,
//       });
//     }

//     const updatedPlant = await prisma.plant.update({
//       where: { id: plant.id },
//       data: {
//         health: Math.min(100, plant.health + 15),
//         waterLevel: Math.min(100, plant.waterLevel + 10),
//         experience: { increment: EXPERIENCE_REWARDS.FERTILIZE },
//       },
//     });

//     await prisma.$transaction([
//       prisma.transaction.create({
//         data: {
//           amount: COIN_REWARDS.FERTILIZE,
//           type: "fertilize",
//           description: "Fertilized plant",
//           userId: req.userId,
//         },
//       }),
//       prisma.user.update({
//         where: { id: req.userId },
//         data: { coins: { increment: COIN_REWARDS.FERTILIZE } },
//       }),
//       prisma.plantCareLog.create({
//         data: {
//           action: "fertilize",
//           details: "Plant fertilized",
//           plantId: plant.id,
//           userId: req.userId,
//         },
//       }),
//     ]);

//     // Check for level up
//     const refreshedPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     const levelResult = await checkAndHandleLevelUp(refreshedPlant, req.userId);

//     const finalPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     let message = "🌿 Plant fertilized! It will grow stronger.";
//     if (levelResult.leveledUp) {
//       message += ` ⭐ Leveled up to ${finalPlant.level}!`;
//     }

//     res.json({
//       success: true,
//       plant: finalPlant,
//       message,
//       leveledUp: levelResult.leveledUp,
//     });
//   } catch (error) {
//     console.error("Fertilize plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to fertilize plant",
//     });
//   }
// };

// // POST: Prune plant
// export const prunePlant = async (req, res) => {
//   try {
//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.status(404).json({
//         success: false,
//         error: "Plant not found",
//         message: "You don't have a plant. Please create one first.",
//       });
//     }

//     if (!plant.isAlive) {
//       return res.status(400).json({
//         success: false,
//         error: "Plant is dead",
//         message: "💀 Your plant is dead. Please reset it to start a new one.",
//       });
//     }

//     // Check if pruned recently (cooldown: 12 hours)
//     const lastPrune = await prisma.plantCareLog.findFirst({
//       where: {
//         plantId: plant.id,
//         action: "prune",
//         timestamp: {
//           gt: new Date(Date.now() - 12 * 60 * 60 * 1000),
//         },
//       },
//     });

//     if (lastPrune) {
//       const hoursRemaining = Math.ceil(
//         (12 * 60 * 60 * 1000 -
//           (Date.now() - new Date(lastPrune.timestamp).getTime())) /
//           (1000 * 60 * 60),
//       );
//       return res.status(400).json({
//         success: false,
//         error: "Too soon to prune",
//         message: `⏳ Please wait ${hoursRemaining} hour(s) before pruning again.`,
//       });
//     }

//     await prisma.plant.update({
//       where: { id: plant.id },
//       data: {
//         health: Math.max(50, plant.health - 5),
//         waterLevel: Math.min(100, plant.waterLevel + 5),
//         experience: { increment: EXPERIENCE_REWARDS.PRUNE },
//       },
//     });

//     await prisma.plantCareLog.create({
//       data: {
//         action: "prune",
//         details: "Plant pruned",
//         plantId: plant.id,
//         userId: req.userId,
//       },
//     });

//     // Check for level up
//     const refreshedPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     const levelResult = await checkAndHandleLevelUp(refreshedPlant, req.userId);

//     const finalPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     let message = "✂️ Plant pruned! It will grow better now.";
//     if (levelResult.leveledUp) {
//       message += ` ⭐ Leveled up to ${finalPlant.level}!`;
//     }

//     res.json({
//       success: true,
//       plant: finalPlant,
//       message,
//       leveledUp: levelResult.leveledUp,
//     });
//   } catch (error) {
//     console.error("Prune plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to prune plant",
//     });
//   }
// };

// // POST: Repot plant
// export const repotPlant = async (req, res) => {
//   try {
//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.status(404).json({
//         success: false,
//         error: "Plant not found",
//         message: "You don't have a plant. Please create one first.",
//       });
//     }

//     if (!plant.isAlive) {
//       return res.status(400).json({
//         success: false,
//         error: "Plant is dead",
//         message: "💀 Your plant is dead. Please reset it to start a new one.",
//       });
//     }

//     // Check if repotted recently (cooldown: 7 days)
//     const lastRepot = await prisma.plantCareLog.findFirst({
//       where: {
//         plantId: plant.id,
//         action: "repot",
//         timestamp: {
//           gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
//         },
//       },
//     });

//     if (lastRepot) {
//       const daysRemaining = Math.ceil(
//         (7 * 24 * 60 * 60 * 1000 -
//           (Date.now() - new Date(lastRepot.timestamp).getTime())) /
//           (1000 * 60 * 60 * 24),
//       );
//       return res.status(400).json({
//         success: false,
//         error: "Too soon to repot",
//         message: `⏳ Please wait ${daysRemaining} day(s) before repotting again.`,
//       });
//     }

//     await prisma.plant.update({
//       where: { id: plant.id },
//       data: {
//         health: Math.min(100, plant.health + 20),
//         waterLevel: Math.min(100, plant.waterLevel + 15),
//         experience: { increment: EXPERIENCE_REWARDS.REPOT },
//       },
//     });

//     await prisma.$transaction([
//       prisma.transaction.create({
//         data: {
//           amount: -25,
//           type: "repot",
//           description: "Repotted plant",
//           userId: req.userId,
//         },
//       }),
//       prisma.user.update({
//         where: { id: req.userId },
//         data: { coins: { decrement: 25 } },
//       }),
//       prisma.plantCareLog.create({
//         data: {
//           action: "repot",
//           details: "Plant repotted",
//           plantId: plant.id,
//           userId: req.userId,
//         },
//       }),
//     ]);

//     // Check for level up
//     const refreshedPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     const levelResult = await checkAndHandleLevelUp(refreshedPlant, req.userId);

//     const finalPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     let message = "🏺 Plant repotted! It has more room to grow.";
//     if (levelResult.leveledUp) {
//       message += ` ⭐ Leveled up to ${finalPlant.level}!`;
//     }

//     res.json({
//       success: true,
//       plant: finalPlant,
//       message,
//       leveledUp: levelResult.leveledUp,
//     });
//   } catch (error) {
//     console.error("Repot plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to repot plant",
//     });
//   }
// };

// // POST: Reset plant
// export const resetPlant = async (req, res) => {
//   try {
//     const existingPlant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!existingPlant) {
//       const newPlant = await prisma.plant.create({
//         data: {
//           userId: req.userId,
//           name: "Sprout",
//           health: 100,
//           waterLevel: 100,
//           growthStage: "seed",
//           experience: 0,
//           level: 1,
//           daysOld: 0,
//           lastStageUpdate: new Date(),
//           lastWateredAt: new Date(),
//           isAlive: true,
//           potType: "basic",
//         },
//       });

//       await prisma.plantMilestone.create({
//         data: {
//           type: "new_plant",
//           name: "New Plant Sprouted",
//           description: "Started a new plant journey!",
//           icon: "🌱",
//           plantId: newPlant.id,
//           userId: req.userId,
//         },
//       });

//       return res.json({
//         success: true,
//         plant: newPlant,
//         message: "🌱 New plant sprouted! Take good care of it.",
//       });
//     }

//     // Reset existing plant
//     const resetPlant = await prisma.plant.update({
//       where: { id: existingPlant.id },
//       data: {
//         name: "Sprout",
//         health: 100,
//         waterLevel: 100,
//         growthStage: "seed",
//         experience: 0,
//         level: 1,
//         daysOld: 0,
//         isAlive: true,
//         potType: "basic",
//         lastStageUpdate: new Date(),
//         lastWateredAt: new Date(),
//         createdAt: new Date(),
//       },
//     });

//     await prisma.plantMilestone.create({
//       data: {
//         type: "new_plant",
//         name: "Plant Revived",
//         description: "Your plant was reset and started anew!",
//         icon: "🔄",
//         plantId: resetPlant.id,
//         userId: req.userId,
//       },
//     });

//     res.json({
//       success: true,
//       plant: resetPlant,
//       message:
//         "🔄 Plant has been reset and is now a seed again! Take good care of it.",
//     });
//   } catch (error) {
//     console.error("Reset plant error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to reset plant",
//     });
//   }
// };

// // Update these functions in controllers/plantController.js

// // GET: Get plant milestones with pagination
// export const getPlantMilestones = async (req, res) => {
//   try {
//     const { limit = 50, offset = 0 } = req.query;

//     const milestones = await prisma.plantMilestone.findMany({
//       where: { userId: req.userId },
//       orderBy: { achievedAt: "desc" },
//       take: parseInt(limit),
//       skip: parseInt(offset),
//     });

//     const totalMilestones = await prisma.plantMilestone.count({
//       where: { userId: req.userId },
//     });

//     res.json({
//       success: true,
//       milestones,
//       pagination: {
//         total: totalMilestones,
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         hasMore: parseInt(offset) + parseInt(limit) < totalMilestones,
//       },
//     });
//   } catch (error) {
//     console.error("Get milestones error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to fetch milestones",
//     });
//   }
// };

// // GET: Get plant care logs with pagination
// export const getPlantCareLogs = async (req, res) => {
//   try {
//     const { limit = 20, offset = 0 } = req.query;

//     const logs = await prisma.plantCareLog.findMany({
//       where: { userId: req.userId },
//       orderBy: { timestamp: "desc" },
//       take: parseInt(limit),
//       skip: parseInt(offset),
//     });

//     const totalLogs = await prisma.plantCareLog.count({
//       where: { userId: req.userId },
//     });

//     res.json({
//       success: true,
//       logs,
//       pagination: {
//         total: totalLogs,
//         limit: parseInt(limit),
//         offset: parseInt(offset),
//         hasMore: parseInt(offset) + parseInt(limit) < totalLogs,
//       },
//     });
//   } catch (error) {
//     console.error("Get care logs error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to fetch care logs",
//     });
//   }
// };

// // PUT: Update plant name with validation
// export const updatePlantName = async (req, res) => {
//   try {
//     const { name } = req.body;

//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.status(404).json({
//         success: false,
//         error: "Plant not found",
//         message: "You don't have a plant yet.",
//       });
//     }

//     const updatedPlant = await prisma.plant.update({
//       where: { id: plant.id },
//       data: { name: name.trim() },
//     });

//     res.json({
//       success: true,
//       plant: updatedPlant,
//       message: `🌿 Plant renamed to "${name.trim()}"!`,
//     });
//   } catch (error) {
//     console.error("Update plant name error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to update plant name",
//     });
//   }
// };

// // GET: Check if plant is dead and needs reset
// export const checkPlantStatus = async (req, res) => {
//   try {
//     const plant = await prisma.plant.findFirst({
//       where: { userId: req.userId },
//     });

//     if (!plant) {
//       return res.json({
//         success: true,
//         hasPlant: false,
//         isAlive: false,
//         message: "No plant found. Create one to get started!",
//       });
//     }

//     res.json({
//       success: true,
//       hasPlant: true,
//       isAlive: plant.isAlive,
//       plant,
//       message: plant.isAlive
//         ? "Plant is alive and well!"
//         : "Plant is dead. Please reset.",
//     });
//   } catch (error) {
//     console.error("Check plant status error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       message: "Failed to check plant status",
//     });
//   }
// };











// controllers/plantController.js
import { prisma } from "../prismaClient.js";
import {
  PLANT_STAGES,
  EXPERIENCE_REWARDS,
  COIN_REWARDS,
  LEVEL_REQUIREMENTS,
} from "../utils/constants.js";

// Get all stages as an ordered array (single source of truth)
const STAGE_LIST = Object.values(PLANT_STAGES);

// Get the first stage safely
const FIRST_STAGE = STAGE_LIST[0];

/**
 * Get an existing plant or create the first plant for the user.
 */
const getOrCreatePlant = async (userId) => {
  let plant = await prisma.plant.findFirst({
    where: { userId },
  });

  if (!plant) {
    plant = await prisma.plant.create({
      data: {
        userId,
        name: FIRST_STAGE.label || "Seed",
        health: 100,
        waterLevel: 100,
        growthStage: FIRST_STAGE.id,
        experience: 0,
        level: 0,
        daysOld: 0,
        lastStageUpdate: new Date(),
        lastWateredAt: new Date(),
        isAlive: true,
        potType: "basic",
      },
    });

    await prisma.plantMilestone.create({
      data: {
        type: "new_plant",
        name: "New Plant Sprouted",
        description: "Started a new plant journey!",
        icon: "🌱",
        plantId: plant.id,
        userId,
      },
    });
  }

  return plant;
};

/**
 * Get the user's plant.
 */
const getPlant = async (userId) => {
  return prisma.plant.findFirst({
    where: { userId },
  });
};

/**
 * Calculate how many full days old the plant is.
 */
const calculateDaysOld = (createdAt) => {
  return Math.floor(
    (Date.now() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24),
  );
};

/**
 * Get the XP required to move from the current level
 * to the next level.
 *
 * LEVEL_REQUIREMENTS contains cumulative XP:
 *
 * Level 1 = 0
 * Level 2 = 100
 * Level 3 = 250
 * Level 4 = 500
 *
 * Therefore:
 *
 * Level 1 -> 2 = 100 XP
 * Level 2 -> 3 = 150 XP
 * Level 3 -> 4 = 250 XP
 */
const getXPRequiredForLevel = (level) => {
  const nextLevel = level + 1;

  const currentRequirement =
    LEVEL_REQUIREMENTS[level] ?? 0;

  const nextRequirement =
    LEVEL_REQUIREMENTS[nextLevel];

  // No next level exists.
  if (nextRequirement === undefined) {
    return null;
  }

  return nextRequirement - currentRequirement;
};

/**
 * Get the highest stage the plant currently qualifies for.
 *
 * A stage requires BOTH:
 * - enough days
 * - enough level
 */
const getCurrentStage = (daysOld, level) => {
  let currentStage = FIRST_STAGE;

  for (const stage of STAGE_LIST) {
    if (
      daysOld >= stage.minDays &&
      level >= stage.level
    ) {
      currentStage = stage;
    }
  }

  return currentStage;
};

/**
 * Handle level-ups.
 *
 * IMPORTANT:
 * Leveling up DOES NOT give additional XP.
 *
 * Example:
 *
 * Current:
 * level = 1
 * experience = 110
 *
 * Level 1 -> 2 requires 100 XP.
 *
 * After level-up:
 * level = 2
 * experience = 10
 *
 * The extra 10 XP is carried over.
 */
const checkAndHandleLevelUp = async (plant, userId) => {
  let leveledUp = false;
  let currentPlant = { ...plant };

  while (true) {
    const xpRequired = getXPRequiredForLevel(
      currentPlant.level,
    );

    // No more levels configured.
    if (xpRequired === null) {
      break;
    }

    // Not enough XP for the next level.
    if (currentPlant.experience < xpRequired) {
      break;
    }

    // Level up.
    currentPlant.level += 1;

    // Remove only the XP required for this level.
    // Do NOT add any XP reward here.
    currentPlant.experience -= xpRequired;

    leveledUp = true;

    const coinReward =
      COIN_REWARDS.LEVEL_UP || 50;

    await prisma.$transaction([
      prisma.plant.update({
        where: { id: currentPlant.id },
        data: {
          level: currentPlant.level,
          experience: currentPlant.experience,
        },
      }),

      prisma.user.update({
        where: { id: userId },
        data: {
          coins: {
            increment: coinReward,
          },
        },
      }),

      prisma.transaction.create({
        data: {
          amount: coinReward,
          type: "level_up_bonus",
          description: `Reached level ${currentPlant.level}!`,
          userId,
        },
      }),

      prisma.plantMilestone.create({
        data: {
          type: "level_up",
          name: `Reached Level ${currentPlant.level}`,
          description: `Your plant reached level ${currentPlant.level}!`,
          icon: "⭐",
          plantId: currentPlant.id,
          userId,
        },
      }),
    ]);
  }

  return {
    plant: currentPlant,
    leveledUp,
  };
};

/**
 * Check whether the plant can move to the next stage.
 */
const shouldAdvanceStage = (plant) => {
  const currentIndex = STAGE_LIST.findIndex(
    (stage) => stage.id === plant.growthStage,
  );

  const nextStage = STAGE_LIST[currentIndex + 1];

  if (!nextStage) {
    return false;
  }

  return (
    plant.daysOld >= nextStage.minDays &&
    plant.level >= nextStage.level
  );
};

/**
 * Fetch the current plant state.
 */
export const fetchPlantState = async (req, res) => {
  try {
    const plant = await getOrCreatePlant(req.userId);

    const daysOld = calculateDaysOld(plant.createdAt);

    if (!plant.isAlive) {
      return res.json({
        success: true,
        plant: {
          ...plant,
          daysOld,
        },
        message:
          "Plant is dead, Please reset to start a new one",
      });
    }

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        daysOld,
      },
    });

    const currentStage = getCurrentStage(
      daysOld,
      plant.level,
    );

    if (currentStage.id !== plant.growthStage) {
      const stageAdvancementReward =
        EXPERIENCE_REWARDS.STAGE_ADVANCE;

      const coinReward =
        COIN_REWARDS.STAGE_ADVANCE;

      await prisma.$transaction([
        prisma.plant.update({
          where: { id: plant.id },
          data: {
            growthStage: currentStage.id,
            lastStageUpdate: new Date(),
            experience: {
              increment: stageAdvancementReward,
            },
          },
        }),

        prisma.transaction.create({
          data: {
            amount: coinReward,
            type: "stage_bonus",
            description: `Advanced to ${currentStage.label} stage!`,
            userId: req.userId,
          },
        }),

        prisma.user.update({
          where: { id: req.userId },
          data: {
            coins: {
              increment: coinReward,
            },
          },
        }),

        prisma.plantMilestone.create({
          data: {
            type: "stage_reached",
            name: `Reached ${currentStage.label} Stage`,
            description:
              `Your plant has grown to the ${currentStage.label} stage!`,
            icon: currentStage.icon,
            plantId: plant.id,
            userId: req.userId,
          },
        }),
      ]);

      const updatedPlant = await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

      const levelResult =
        await checkAndHandleLevelUp(
          updatedPlant,
          req.userId,
        );

      return res.json({
        success: true,
        plant: levelResult.plant,
        message: `🌱 Your plant reached ${currentStage.label} stage!`,
        stageAdvancement: true,
        leveledUp: levelResult.leveledUp,
        rewards: {
          experience: stageAdvancementReward,
          coins: coinReward,
        },
      });
    }

    const updatedPlant = await prisma.plant.findFirst({
      where: { userId: req.userId },
    });

    res.json({
      success: true,
      plant: updatedPlant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      message: "failed to fetch plant data",
    });
  }
};

/**
 * Water plant.
 */
export const waterPlant = async (req, res) => {
  try {
    const plant = await getPlant(req.userId);

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: "Plant not found",
        message:
          "You don't have a plant. Please create one first.",
      });
    }

    if (!plant.isAlive) {
      return res.status(400).json({
        success: false,
        error: "Plant is dead",
        message:
          "💀 Your plant is dead. Please reset it to start a new one.",
      });
    }

    const minutesSinceWatered =
      (Date.now() -
        new Date(plant.lastWateredAt).getTime()) /
      (1000 * 60);

    const COOLDOWN_MINUTES = 5;

    if (minutesSinceWatered < COOLDOWN_MINUTES) {
      return res.status(400).json({
        success: false,
        error: "Too soon to water",
        message:
          "⏳ Please wait 5 minute(s) before watering again.",
      });
    }

    const hoursSinceWatered =
      minutesSinceWatered / 60;

    let bonusCoins = 0;
    let bonusXP = 0;

    if (hoursSinceWatered < 1) {
      bonusCoins =
        COIN_REWARDS.WATER_BONUS || 5;

      bonusXP = 5;
    }

    const healthIncrease =
      10 + (plant.waterLevel < 50 ? 5 : 0);

    const newHealth = Math.min(
      100,
      plant.health + healthIncrease,
    );

    const newWaterLevel = Math.min(
      100,
      plant.waterLevel + 20,
    );

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        health: newHealth,
        waterLevel: newWaterLevel,
        lastWateredAt: new Date(),
        experience: {
          increment:
            EXPERIENCE_REWARDS.WATER + bonusXP,
        },
      },
    });

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: bonusCoins,
          type: "water_bonus",
          description:
            bonusCoins > 0
              ? "Consistency bonus for watering!"
              : "Watered plant",
          userId: req.userId,
        },
      }),

      ...(bonusCoins > 0
        ? [
            prisma.user.update({
              where: { id: req.userId },
              data: {
                coins: {
                  increment: bonusCoins,
                },
              },
            }),
          ]
        : []),

      prisma.plantCareLog.create({
        data: {
          action: "water",
          details:
            bonusCoins > 0
              ? "Watered with bonus!"
              : "Watered",
          plantId: plant.id,
          userId: req.userId,
        },
      }),
    ]);

    const refreshedPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    const levelResult =
      await checkAndHandleLevelUp(
        refreshedPlant,
        req.userId,
      );

    // Refresh daysOld before checking stage advancement.
    const daysOld = calculateDaysOld(
      levelResult.plant.createdAt,
    );

    if (
      daysOld !== levelResult.plant.daysOld
    ) {
      await prisma.plant.update({
        where: { id: levelResult.plant.id },
        data: { daysOld },
      });

      levelResult.plant.daysOld = daysOld;
    }

    const shouldAdvance =
      shouldAdvanceStage(levelResult.plant);

    let stageAdvancementMessage = "";
    let stageAdvanced = false;

    if (shouldAdvance) {
      const nextStage = getCurrentStage(
        levelResult.plant.daysOld,
        levelResult.plant.level,
      );

      await prisma.plant.update({
        where: { id: plant.id },
        data: {
          growthStage: nextStage.id,
          lastStageUpdate: new Date(),
        },
      });

      stageAdvancementMessage =
        ` 🌱 Advanced to ${nextStage.label}!`;

      stageAdvanced = true;
    }

    const finalPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    let message = "💧 Plant watered!";

    if (stageAdvanced) {
      message += stageAdvancementMessage;
    }

    if (levelResult.leveledUp) {
      message +=
        ` ⭐ Leveled up to ${finalPlant.level}!`;
    }

    res.json({
      success: true,
      plant: finalPlant,
      bonusCoins,
      bonusXP,
      message,
      stageAdvanced,
      leveledUp: levelResult.leveledUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to water plant",
    });
  }
};

/**
 * Fertilize plant.
 */
export const fertilizePlant = async (req, res) => {
  try {
    const plant = await prisma.plant.findFirst({
      where: { userId: req.userId },
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: "Plant not found",
        message:
          "You don't have a plant. Please create one first.",
      });
    }

    if (!plant.isAlive) {
      return res.status(400).json({
        success: false,
        error: "Plant is dead",
        message:
          "💀 Your plant is dead. Please reset it to start a new one.",
      });
    }

    const lastFertilize =
      await prisma.plantCareLog.findFirst({
        where: {
          plantId: plant.id,
          action: "fertilize",
          timestamp: {
            gt: new Date(
              Date.now() - 24 * 60 * 60 * 1000,
            ),
          },
        },
      });

    if (lastFertilize) {
      const hoursRemaining = Math.ceil(
        (24 * 60 * 60 * 1000 -
          (Date.now() -
            new Date(
              lastFertilize.timestamp,
            ).getTime())) /
          (1000 * 60 * 60),
      );

      return res.status(400).json({
        success: false,
        error: "Too soon to fertilize",
        message:
          `⏳ Please wait ${hoursRemaining} hour(s) before fertilizing again.`,
      });
    }

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: COIN_REWARDS.FERTILIZE,
          type: "fertilize",
          description: "Fertilized plant",
          userId: req.userId,
        },
      }),

      prisma.user.update({
        where: { id: req.userId },
        data: {
          coins: {
            increment: COIN_REWARDS.FERTILIZE,
          },
        },
      }),

      prisma.plantCareLog.create({
        data: {
          action: "fertilize",
          details: "Plant fertilized",
          plantId: plant.id,
          userId: req.userId,
        },
      }),

      prisma.plant.update({
        where: { id: plant.id },
        data: {
          health: Math.min(
            100,
            plant.health + 15,
          ),
          waterLevel: Math.min(
            100,
            plant.waterLevel + 10,
          ),
          experience: {
            increment:
              EXPERIENCE_REWARDS.FERTILIZE,
          },
        },
      }),
    ]);

    const refreshedPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    const levelResult =
      await checkAndHandleLevelUp(
        refreshedPlant,
        req.userId,
      );

    const finalPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    let message =
      "🌿 Plant fertilized! It will grow stronger.";

    if (levelResult.leveledUp) {
      message +=
        ` ⭐ Leveled up to ${finalPlant.level}!`;
    }

    res.json({
      success: true,
      plant: finalPlant,
      message,
      leveledUp: levelResult.leveledUp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fertilize plant",
    });
  }
};

/**
 * Prune plant.
 */
export const prunePlant = async (req, res) => {
  try {
    const plant = await prisma.plant.findFirst({
      where: { userId: req.userId },
    });

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: "Plant not found",
        message:
          "You don't have a plant. Please create one first.",
      });
    }

    if (!plant.isAlive) {
      return res.status(400).json({
        success: false,
        error: "Plant is dead",
        message:
          "💀 Your plant is dead. Please reset it to start a new one.",
      });
    }

    const lastPrune =
      await prisma.plantCareLog.findFirst({
        where: {
          plantId: plant.id,
          action: "prune",
          timestamp: {
            gt: new Date(
              Date.now() - 12 * 60 * 60 * 1000,
            ),
          },
        },
      });

    if (lastPrune) {
      const hoursRemaining = Math.ceil(
        (12 * 60 * 60 * 1000 -
          (Date.now() -
            new Date(
              lastPrune.timestamp,
            ).getTime())) /
          (1000 * 60 * 60),
      );

      return res.status(400).json({
        success: false,
        error: "Too soon to prune",
        message:
          `⏳ Please wait ${hoursRemaining} hour(s) before pruning again.`,
      });
    }

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        health: Math.max(
          50,
          plant.health - 5,
        ),
        waterLevel: Math.min(
          100,
          plant.waterLevel + 5,
        ),
        experience: {
          increment: EXPERIENCE_REWARDS.PRUNE,
        },
      },
    });

    await prisma.plantCareLog.create({
      data: {
        action: "prune",
        details: "Plant pruned",
        plantId: plant.id,
        userId: req.userId,
      },
    });

    const refreshedPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    const levelResult =
      await checkAndHandleLevelUp(
        refreshedPlant,
        req.userId,
      );

    const finalPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    let message =
      "✂️ Plant pruned! It will grow better now.";

    if (levelResult.leveledUp) {
      message +=
        ` ⭐ Leveled up to ${finalPlant.level}!`;
    }

    res.json({
      success: true,
      plant: finalPlant,
      message,
      leveledUp: levelResult.leveledUp,
    });
  } catch (error) {
    console.error(
      "Prune plant error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to prune plant",
    });
  }
};

/**
 * Repot plant.
 */
export const repotPlant = async (req, res) => {
  try {
    const plant = await getPlant(req.userId);

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: "Plant not found",
        message:
          "You don't have a plant. Please create one first.",
      });
    }

    if (!plant.isAlive) {
      return res.status(400).json({
        success: false,
        error: "Plant is dead",
        message:
          "💀 Your plant is dead. Please reset it to start a new one.",
      });
    }

    const lastRepot =
      await prisma.plantCareLog.findFirst({
        where: {
          plantId: plant.id,
          action: "repot",
          timestamp: {
            gt: new Date(
              Date.now() -
                7 * 24 * 60 * 60 * 1000,
            ),
          },
        },
      });

    if (lastRepot) {
      const daysRemaining = Math.ceil(
        (7 * 24 * 60 * 60 * 1000 -
          (Date.now() -
            new Date(
              lastRepot.timestamp,
            ).getTime())) /
          (1000 * 60 * 60 * 24),
      );

      return res.status(400).json({
        success: false,
        error: "Too soon to repot",
        message:
          `⏳ Please wait ${daysRemaining} day(s) before repotting again.`,
      });
    }

    const REPOT_COST = 25;

    await prisma.plant.update({
      where: { id: plant.id },
      data: {
        health: Math.min(
          100,
          plant.health + 20,
        ),
        waterLevel: Math.min(
          100,
          plant.waterLevel + 15,
        ),
        experience: {
          increment: EXPERIENCE_REWARDS.REPOT,
        },
      },
    });

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          amount: -REPOT_COST,
          type: "repot",
          description: "Repotted plant",
          userId: req.userId,
        },
      }),

      prisma.user.update({
        where: { id: req.userId },
        data: {
          coins: {
            decrement: REPOT_COST,
          },
        },
      }),

      prisma.plantCareLog.create({
        data: {
          action: "repot",
          details: "Plant repotted",
          plantId: plant.id,
          userId: req.userId,
        },
      }),
    ]);

    const refreshedPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    const levelResult =
      await checkAndHandleLevelUp(
        refreshedPlant,
        req.userId,
      );

    const finalPlant =
      await prisma.plant.findFirst({
        where: { userId: req.userId },
      });

    let message =
      "🏺 Plant repotted! It has more room to grow.";

    if (levelResult.leveledUp) {
      message +=
        ` ⭐ Leveled up to ${finalPlant.level}!`;
    }

    res.json({
      success: true,
      plant: finalPlant,
      message,
      leveledUp: levelResult.leveledUp,
    });
  } catch (error) {
    console.error(
      "Repot plant error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to repot plant",
    });
  }
};

/**
 * Reset plant.
 */
export const resetPlant = async (req, res) => {
  try {
    const existingPlant =
      await getPlant(req.userId);

    if (!existingPlant) {
      const newPlant =
        await prisma.plant.create({
          data: {
            userId: req.userId,
            name: FIRST_STAGE.label || "Seed",
            health: 100,
            waterLevel: 100,
            growthStage: FIRST_STAGE.id,
            experience: 0,
            level: 0,
            daysOld: 0,
            lastStageUpdate: new Date(),
            lastWateredAt: new Date(),
            isAlive: true,
            potType: "basic",
          },
        });

      await prisma.plantMilestone.create({
        data: {
          type: "new_plant",
          name: "New Plant Sprouted",
          description:
            "Started a new plant journey!",
          icon: "🌱",
          plantId: newPlant.id,
          userId: req.userId,
        },
      });

      return res.json({
        success: true,
        plant: newPlant,
        message:
          "🌱 New plant sprouted! Take good care of it.",
      });
    }

    const resetPlant =
      await prisma.plant.update({
        where: { id: existingPlant.id },
        data: {
          name: FIRST_STAGE.label || "Seed",
          health: 100,
          waterLevel: 100,
          growthStage: FIRST_STAGE.id,
          experience: 0,
          level: 0,
          daysOld: 0,
          isAlive: true,
          potType: "basic",
          lastStageUpdate: new Date(),
          lastWateredAt: new Date(),
          createdAt: new Date(),
        },
      });

    await prisma.plantMilestone.create({
      data: {
        type: "new_plant",
        name: "Plant Revived",
        description:
          "Your plant was reset and started anew!",
        icon: "🔄",
        plantId: resetPlant.id,
        userId: req.userId,
      },
    });

    res.json({
      success: true,
      plant: resetPlant,
      message:
        "🔄 Plant has been reset and is now a seed again! Take good care of it.",
    });
  } catch (error) {
    console.error(
      "Reset plant error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to reset plant",
    });
  }
};

/**
 * Get plant milestones.
 */
export const getPlantMilestones = async (
  req,
  res,
) => {
  try {
    const {
      limit = 50,
      offset = 0,
    } = req.query;

    const milestones =
      await prisma.plantMilestone.findMany({
        where: {
          userId: req.userId,
        },
        orderBy: {
          achievedAt: "desc",
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

    const totalMilestones =
      await prisma.plantMilestone.count({
        where: {
          userId: req.userId,
        },
      });

    res.json({
      success: true,
      milestones,
      pagination: {
        total: totalMilestones,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore:
          parseInt(offset) +
            parseInt(limit) <
          totalMilestones,
      },
    });
  } catch (error) {
    console.error(
      "Get milestones error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch milestones",
    });
  }
};

/**
 * Get plant care logs.
 */
export const getPlantCareLogs = async (
  req,
  res,
) => {
  try {
    const {
      limit = 20,
      offset = 0,
    } = req.query;

    const logs =
      await prisma.plantCareLog.findMany({
        where: {
          userId: req.userId,
        },
        orderBy: {
          timestamp: "desc",
        },
        take: parseInt(limit),
        skip: parseInt(offset),
      });

    const totalLogs =
      await prisma.plantCareLog.count({
        where: {
          userId: req.userId,
        },
      });

    res.json({
      success: true,
      logs,
      pagination: {
        total: totalLogs,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore:
          parseInt(offset) +
            parseInt(limit) <
          totalLogs,
      },
    });
  } catch (error) {
    console.error(
      "Get care logs error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to fetch care logs",
    });
  }
};

/**
 * Update plant name.
 */
export const updatePlantName = async (
  req,
  res,
) => {
  try {
    const { name } = req.body;

    const plant =
      await prisma.plant.findFirst({
        where: {
          userId: req.userId,
        },
      });

    if (!plant) {
      return res.status(404).json({
        success: false,
        error: "Plant not found",
        message:
          "You don't have a plant yet.",
      });
    }

    const updatedPlant =
      await prisma.plant.update({
        where: {
          id: plant.id,
        },
        data: {
          name: name.trim(),
        },
      });

    res.json({
      success: true,
      plant: updatedPlant,
      message:
        `🌿 Plant renamed to "${name.trim()}"!`,
    });
  } catch (error) {
    console.error(
      "Update plant name error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to update plant name",
    });
  }
};

/**
 * Check whether the user has a plant and whether it is alive.
 */
export const checkPlantStatus = async (
  req,
  res,
) => {
  try {
    const plant =
      await prisma.plant.findFirst({
        where: {
          userId: req.userId,
        },
      });

    if (!plant) {
      return res.json({
        success: true,
        hasPlant: false,
        isAlive: false,
        message:
          "No plant found. Create one to get started!",
      });
    }

    res.json({
      success: true,
      hasPlant: true,
      isAlive: plant.isAlive,
      plant,
      message: plant.isAlive
        ? "Plant is alive and well!"
        : "Plant is dead. Please reset.",
    });
  } catch (error) {
    console.error(
      "Check plant status error:",
      error,
    );

    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to check plant status",
    });
  }
};