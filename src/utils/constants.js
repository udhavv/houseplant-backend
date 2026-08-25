// utils/plantConstants.js

// Plant stages with their requirements
export const PLANT_STAGES = {
  SEED: {
    id: 'seed',
    label: 'Seed',
    icon: '🌰',
    healthRange: [0, 20],
    minDays: 0,
    experienceRequired: 0,
    color: 'from-amber-200 to-amber-400',
    description: 'A tiny seed waiting to sprout',
    growthRate: 0.5,
  },
  SPROUT: {
    id: 'sprout',
    label: 'Sprout',
    icon: '🌱',
    healthRange: [21, 40],
    minDays: 2,
    experienceRequired: 50,
    color: 'from-green-200 to-green-400',
    description: 'First signs of life emerging',
    growthRate: 1.0,
  },
  SEEDLING: {
    id: 'seedling',
    label: 'Seedling',
    icon: '🌿',
    healthRange: [41, 60],
    minDays: 5,
    experienceRequired: 150,
    color: 'from-green-300 to-green-500',
    description: 'Developing true leaves',
    growthRate: 1.5,
  },
  YOUNG: {
    id: 'young',
    label: 'Young Plant',
    icon: '🌳',
    healthRange: [61, 80],
    minDays: 10,
    experienceRequired: 350,
    color: 'from-green-400 to-emerald-500',
    description: 'Growing taller and stronger',
    growthRate: 2.0,
  },
  MATURE: {
    id: 'mature',
    label: 'Mature Plant',
    icon: '🌲',
    healthRange: [81, 95],
    minDays: 20,
    experienceRequired: 600,
    color: 'from-emerald-400 to-teal-500',
    description: 'Full growth achieved',
    growthRate: 2.5,
  },
  FLOWERING: {
    id: 'flowering',
    label: 'Flowering',
    icon: '🌸',
    healthRange: [81, 100],
    minDays: 30,
    experienceRequired: 900,
    color: 'from-pink-400 to-rose-500',
    description: 'Beautiful blooms appear',
    growthRate: 3.0,
  },
  FRUITING: {
    id: 'fruiting',
    label: 'Fruiting',
    icon: '🍎',
    healthRange: [81, 100],
    minDays: 40,
    experienceRequired: 1200,
    color: 'from-red-400 to-orange-500',
    description: 'Fruits of your labor',
    growthRate: 3.5,
  },
}




// Health thresholds for stage advancement
export const HEALTH_THRESHOLDS = {
  CRITICAL: 20,
  POOR: 40,
  MODERATE: 60,
  GOOD: 80,
  EXCELLENT: 95,
}

// Experience rewards for actions
export const EXPERIENCE_REWARDS = {
  WATER: 10,
  FERTILIZE: 15,
  PRUNE: 20,
  REPOT: 25,
  DAILY_CHECKIN: 30,
  STAGE_ADVANCE: 50,
  LEVEL_UP: 100,
}

// Coin rewards
export const COIN_REWARDS = {
  WATER: 5,
  WATER_BONUS: 5,  // Added: Bonus for consistent watering
  FERTILIZE: 10,
  DAILY_CHECKIN: 20,
  STAGE_ADVANCE: 25,
  LEVEL_UP: 50,
}

// Level requirements (XP needed for each level)
export const LEVEL_REQUIREMENTS = {
  1: 0,
  2: 100,
  3: 250,
  4: 500,
  5: 800,
  6: 1200,
  7: 1700,
  8: 2300,
  9: 3000,
  10: 4000,
}