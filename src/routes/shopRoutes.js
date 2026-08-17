import express from 'express'
import { prisma } from '../prismaClient.js'
import { authenticate } from '../middleware/auth.js'
import { getUserBalance, dailyCheckin, buyPot } from '../controllers/shopController.js'

const router= express.Router()


router.get('/balance', authenticate, getUserBalance)
router.post('/checkin', authenticate, dailyCheckin)
router.post('/buy-pot', authenticate, buyPot)


export default router;