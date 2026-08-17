import express from 'express'
import { prisma } from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// GET: Fetch current plant state
const fetchPlantState = async (req, res) => {
try {
    const plant = await prisma.plant.findFirst({
      where: { userId: req.userId }
    })
    
    if (!plant) {
      // Create a new plant if they don't have one
      const newPlant = await prisma.plant.create({
        data: { userId: req.userId }
      })
      return res.json(newPlant)
    }
    
    res.json(plant)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST: Water the plant
const waterPlant = async (req, res) => {
try {
    const plant = await prisma.plant.findFirst({
      where: { userId: req.userId }
    })

    if (!plant || !plant.isAlive) {
      return res.status(400).json({ error: 'Your plant is dead! Start a new one.' })
    }

    // Calculate time since last watering
    const hoursSinceWatered = (Date.now() - new Date(plant.lastWateredAt).getTime()) / (1000 * 60 * 60)
    
    // Bonus: If watered within 1 hour of last watering, add bonus coins
    let bonusCoins = 0
    if (hoursSinceWatered < 1) {
      bonusCoins = 5 // Consistency bonus!
    }

    const updatedPlant = await prisma.plant.update({
      where: { id: plant.id },
      data: {
        health: Math.min(100, plant.health + 20),
        lastWateredAt: new Date()
      }
    })

    // Log the transaction
    if (bonusCoins > 0) {
      await prisma.transaction.create({
        data: {
          amount: bonusCoins,
          type: 'water_bonus',
          userId: req.userId
        }
      })
    }

    res.json({ 
      plant: updatedPlant, 
      bonusCoins,
      message: bonusCoins > 0 ? '🌿 Bonus +5 coins for consistent watering!' : '💧 Plant watered!'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

// POST: Reset/Start new plant (when old one dies)
const resetPlant = async (req, res) => {
try {
    // Soft delete old plant
    await prisma.plant.updateMany({
      where: { userId: req.userId },
      data: { isAlive: false }
    })

    const newPlant = await prisma.plant.create({
      data: { 
        userId: req.userId,
        health: 100,
        waterLevel: 100
      }
    })

    res.json({ plant: newPlant, message: '🌱 New plant sprouted!' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export { fetchPlantState, waterPlant, resetPlant }
