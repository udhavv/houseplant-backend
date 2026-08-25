import express from 'express'
import { prisma } from '../prismaClient.js'



const router = express.Router()
const POT_PRICES = { basic: 0, ceramic: 50, golden: 200 }

// GET: Get user's current coins
const getUserBalance= async (req, res) => {
  try{
    console.log('**************************************')
    const transactions = await prisma.transaction.aggregate({
      where: { userId: req.userId },
      _sum: { amount: true }
    })
    res.json({ coins: transactions._sum.amount || 0 })
    // console.log(transactions._sum.amount || 0)
    return transactions._sum.amount || 0
  } catch (error) {
    throw new Error('Failed to fetch user balance')
  }
}

// POST: Daily check-in
const dailyCheckin = async (req, res) => {
// router.post('/checkin', authenticate, async (req, res) => {
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
  const checkinAmount = 20
  await prisma.transaction.create({
    data: {
      amount: checkinAmount,
      type: 'daily_checkin',
      description: 'Daily check-in reward',
      userId: req.userId
    }
  })

await prisma.plant.updateMany({
      where: { userId: req.userId, isAlive: true },
      data: {
        experience: { increment: 10 } // XP reward for check-in
      }
    })

    res.json({ 
      success: true,
      coins: checkinAmount, 
      message: '✅ Daily check-in complete! You earned 20 coins!'
    })
  }

// POST: Buy a pot
const buyPot = async (req, res) => {
// router.post('/buy-pot', authenticate, async (req, res) => {
  try{
  const { potType } = req.body
  
   if (!POT_PRICES.hasOwnProperty(potType)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid pot type',
        message: 'Please select a valid pot type.'
      })
    }

  const price = POT_PRICES[potType]
  const balance = await prisma.transaction.aggregate({
    where: { userId: req.userId },
    _sum: { amount: true }
  })

  const currentCoins = balance._sum.amount || 0
  
  if (currentCoins < price) {
      return res.status(400).json({ 
        success: false,
        error: 'Not enough coins!',
        message: `You need ${price - currentCoins} more coins to buy this pot.`
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

  // Deduct coins and update plant
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        amount: -price,
        type: 'purchase_pot',
        userId: req.userId
      }
    }),
    prisma.plant.updateMany({
      where: { userId: req.userId },
      data: { potType }
    })
  ])

  const newBalance= await prisma.transaction.aggregate({
    where: { userId: req.userId },
    _sum: { amount: true }
  })

res.json({ 
      success: true,
      message: `✨ Upgraded to ${potType} pot!`,
      coins: newBalance._sum.amount || 0
    })
  }
  catch (error) {
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