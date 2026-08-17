import express from 'express'
import {
  fetchPlantState,
    waterPlant,
    resetPlant
} from '../controllers/plantController.js'
import {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken
} from '../middleware/validators.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// Public routes
router.get('/', authenticate, fetchPlantState)
router.post('/water', authenticate, waterPlant)
router.post('/reset', authenticate, resetPlant)

// Private routes

export default router