// controllers/authController.js
import { prisma } from '../prismaClient.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { validationResult } from 'express-validator'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.js'
import { comparePassword, hashPassword, generateTokens, generateRandomToken, setTokenCookies, clearTokenCookies } from '../utils/extra.js'

// user registration
export const register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { email, username, password } = req.body
    console.log('Registration request body:', req.body)

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    })

    if (existingUser) {
      const errorMessage = existingUser.email === email.toLowerCase() 
        ? 'Email already registered' 
        : 'Username already taken'
      
      return res.status(409).json({ 
        success: false,
        error: errorMessage,
        message: errorMessage
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate email verification token
    const emailVerificationToken = generateRandomToken()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        emailVerificationToken,
        emailVerificationExpires,
        // Create a default plant automatically
        plants: {
          create: {}
        }
      }
    })

    // Send verification email (don't await - fire and forget)
    sendVerificationEmail(user.email, user.username, emailVerificationToken)
      .catch(err => console.error('Email send failed:', err))

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    })

    // Set HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken)

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Please check your email to verify your account.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { email, password } = req.body
    console.log('Login request body:', req.body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password. Please try again.'
      })
    }

    // Check password
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid credentials',
        message: 'Invalid email or password. Please try again.'
      })
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Resend verification email
      const newToken = generateRandomToken()
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerificationToken: newToken,
          emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      })
      sendVerificationEmail(user.email, user.username, newToken)
        .catch(err => console.error('Email send failed:', err))
      
      return res.status(403).json({ 
        success: false,
        error: 'Email not verified',
        message: 'Please verify your email. A new verification link has been sent to your inbox.'
      })
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user.id)

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    })

    // Set HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken)

    res.json({
      success: true,
      message: 'Welcome back! Login successful.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires refresh token from cookie)
 */
export const refresh = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Refresh token required',
        message: 'Please login again.'
      })
    }

    // Verify refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired refresh token',
        message: 'Session expired. Please login again.'
      })
    }

    // Check if token exists in DB and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })

    if (!storedToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Refresh token not found',
        message: 'Please login again.'
      })
    }

    if (storedToken.isRevoked) {
      // Token reuse detected! Revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true }
      })
      // Clear cookies on token reuse
      clearTokenCookies(res)
      return res.status(401).json({ 
        success: false,
        error: 'Token revoked',
        message: 'Security violation detected. Please login again.'
      })
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({ 
        success: false,
        error: 'Refresh token expired',
        message: 'Session expired. Please login again.'
      })
    }

    // Check if user still exists
    if (!storedToken.user) {
      return res.status(401).json({ 
        success: false,
        error: 'User not found',
        message: 'User account not found. Please login again.'
      })
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(storedToken.userId)

    // Revoke old refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true }
    })

    // Store new refresh token
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress
      }
    })

    // Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken)

    res.json({
      success: true,
      message: 'Session refreshed successfully.'
    })

  } catch (error) {
    console.error('Refresh error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      // Revoke the specific refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      })
    }

    // Clear cookies
    clearTokenCookies(res)

    res.json({
      success: true,
      message: 'Logged out successfully. See you soon!'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification token',
        message: 'The verification link is invalid or has expired. Please request a new one.'
      })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    res.json({
      success: true,
      message: 'Email verified successfully! You can now login to your account.'
    })

  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Request password reset
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { email } = req.body

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      // Don't reveal if email exists or not (security best practice)
      return res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      })
    }

    const resetToken = generateRandomToken()
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    })

    sendPasswordResetEmail(user.email, user.username, resetToken)
      .catch(err => console.error('Email send failed:', err))

    res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent to your inbox.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { token } = req.params
    const { password } = req.body

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      }
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
        message: 'The password reset link is invalid or has expired. Please request a new one.'
      })
    }

    const passwordHash = await hashPassword(password)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    })

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId: user.id },
      data: { isRevoked: true }
    })

    // Clear cookies on password reset
    clearTokenCookies(res)

    res.json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Get current authenticated user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const me = async (req, res) => {
  try {
    console.log('Me route called - Getting current user')
    
    // Get access token from cookie
    const accessToken = req.cookies?.accessToken

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        message: 'Please login to access this resource.'
      })
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
          message: 'Session expired. Please refresh your session.'
        })
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: 'Invalid session. Please login again.'
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'User account not found. Please login again.'
      })
    }

    res.json({
      success: true,
      message: 'User authenticated successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Me route error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Private
 */
export const resendVerification = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
        message: 'Please login to request a new verification email.'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'User account not found.'
      })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified',
        message: 'Your email is already verified.'
      })
    }

    // Generate new verification token
    const newToken = generateRandomToken()
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: newToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    })

    // Send verification email
    sendVerificationEmail(user.email, user.username, newToken)
      .catch(err => console.error('Email send failed:', err))

    res.json({
      success: true,
      message: 'Verification email sent successfully! Please check your inbox.'
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Something went wrong. Please try again later.'
    })
  }
}