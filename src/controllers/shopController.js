import express from 'express'
import { prisma } from '../prismaClient.js'

import { COIN_REWARDS } from '../utils/constants.js'

const router = express.Router()
const POT_PRICES = { basic: 0, ceramic: 100, golden: 300 }

// GET: Get user's current coins
const getUserBalance = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { coins: true }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist.'
      })
    }

    res.json({ coins: user.coins })
  } catch (error) {
    console.error('Get balance error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to fetch user balance'
    })
  }
}

// POST: Daily check-in
const dailyCheckin = async (req, res) => {
  try{

  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Check if user already checked in today
  const existingCheckin = await prisma.transaction.findFirst({
    where: {
      userId: req.userId,
      type: 'daily_checkin',
      createdAt: { gte: today }
    }
  })

  if (existingCheckin) {
      return res.status(400).json({ 
        success: false,
        error: 'Already checked in today!',
        message: 'You have already claimed your daily check-in reward.'
      })
    }

  // Award coins
  const checkinAmount = COIN_REWARDS.DAILY_CHECKIN
  const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId },
        data: { coins: { increment: checkinAmount } },
        select: { coins: true }
      }),
      prisma.transaction.create({
        data: {
          amount: checkinAmount,
          type: 'daily_checkin',
          description: 'Daily check-in reward',
          userId: req.userId
        }
      }),
      prisma.plant.updateMany({
        where: { userId: req.userId, isAlive: true },
        data: { experience: { increment: 10 } }
      })
    ])

    res.json({
      success: true,
      coins: updatedUser.coins,
      earned: checkinAmount,
      message: ' Daily check-in complete! You earned 20 coins!'
    })
  } catch(error){
    if(process.env.NODE_ENV === 'production'){
      console.log('error in the daily checkin: ', error)
    }
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'failed to process daily check-in'
    })
  }
  }

// POST: Buy a pot
const buyPot = async (req, res) => {
  try {
    const { potType } = req.body

    if (!POT_PRICES.hasOwnProperty(potType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid pot type',
        message: 'Please select a valid pot type.'
      })
    }

    const price = POT_PRICES[potType]

    //  Read balance from User.coins
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { coins: true }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User does not exist.'
      })
    }

    if (user.coins < price) {
      return res.status(400).json({
        success: false,
        error: 'Not enough coins!',
        message: `You need ${price - user.coins} more coins to buy this pot.`
      })
    }

    // Check if user already has this pot type
    const existingPlant = await prisma.plant.findFirst({
      where: { userId: req.userId }
    })

    if (existingPlant && existingPlant.potType === potType) {
      return res.status(400).json({
        success: false,
        error: 'Already owned',
        message: `You already have the ${potType} pot equipped.`
      })
    }

    //  Deduct from User.coins AND log transaction atomically
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: req.userId },
        data: { coins: { decrement: price } },
        select: { coins: true }
      }),
      prisma.transaction.create({
        data: {
          amount: -price,
          type: 'purchase_pot',
          description: `Purchased ${potType} pot`,
          userId: req.userId
        }
      }),
      prisma.plant.updateMany({
        where: { userId: req.userId },
        data: { potType }
      })
    ])

    res.json({
      success: true,
      message: `✨ Upgraded to ${potType} pot!`,
      coins: updatedUser.coins
    })
  } catch (error) {
    console.error('Error in buyPot:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Failed to purchase pot.'
    })
  }
}

export { getUserBalance, dailyCheckin, buyPot }
export default router