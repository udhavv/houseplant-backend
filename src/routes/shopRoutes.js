// routes/shopRoutes.js
import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { getUserBalance, dailyCheckin, buyPot } from '../controllers/shopController.js'
import {
  validateGetBalance,
  validateDailyCheckin,
  validateBuyPot
} from '../middleware/shopValidator.js'

const router = express.Router()

// All shop routes require authentication
router.use(authenticate)

// Shop routes with validation
router.get('/balance', validateGetBalance, getUserBalance)
router.post('/checkin', validateDailyCheckin, dailyCheckin)
router.post('/buy-pot', validateBuyPot, buyPot)

export default router