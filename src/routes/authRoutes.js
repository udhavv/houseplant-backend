import express from 'express'
import {
  register,
  login,
  refresh,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js'
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
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/refresh', validateRefreshToken, refresh)
router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.post('/reset-password/:token', validateResetPassword, resetPassword)
router.get('/verify-email/:token', verifyEmail)

// Private routes
router.post('/logout', authenticate, logout)

export default router