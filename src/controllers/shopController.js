import express from 'express'
import { prisma } from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
const POT_PRICES = { basic: 0, ceramic: 50, golden: 200 }

// GET: Get user's current coins
const getUserBalance= async (req, res) => {
  try{
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
    return res.status(400).json({ error: 'Already checked in today!' })
  }

  // Award coins
  const checkinAmount = 20
  await prisma.transaction.create({
    data: {
      amount: checkinAmount,
      type: 'daily_checkin',
      userId: req.userId
    }
  })

  res.json({ coins: checkinAmount, message: '✅ Daily check-in complete!' })
}

// POST: Buy a pot
const buyPot = async (req, res) => {
// router.post('/buy-pot', authenticate, async (req, res) => {
  const { potType } = req.body
  
  if (!POT_PRICES[potType]) {
    return res.status(400).json({ error: 'Invalid pot type' })
  }

  const price = POT_PRICES[potType]
  const balance = await prisma.transaction.aggregate({
    where: { userId: req.userId },
    _sum: { amount: true }
  })

  const currentCoins = balance._sum.amount || 0
  
  if (currentCoins < price) {
    return res.status(400).json({ error: 'Not enough coins!' })
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

  res.json({ message: `✨ Upgraded to ${potType} pot!` })
}

export { getUserBalance, dailyCheckin, buyPot }
export default router