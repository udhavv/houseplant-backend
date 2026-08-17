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
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { email, username, password } = req.body

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
      return res.status(409).json({ 
        error: existingUser.email === email.toLowerCase() 
          ? 'Email already registered' 
          : 'Username already taken'
      })
    }

    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Generate email verification token
    const emailVerificationToken = generateRandomToken()
    const emailVerificationExpires = new Date(Date.now() + 5 * 60 * 60 * 1000) // 5 hours

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

    // ✅ Set HTTP-only cookies instead of sending tokens in response
    setTokenCookies(res, accessToken, refreshToken)

    res.status(201).json({
      message: 'User registered successfully. Please verify your email.',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
      // ❌ NO tokens in response - they're in HttpOnly cookies!
    })

  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      })
    }

    const { email, password } = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
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
        error: 'Email not verified. A new verification link has been sent.'
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

    // ✅ Set HTTP-only cookies
    setTokenCookies(res, accessToken, refreshToken)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
      // ❌ NO tokens in response!
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public (requires refresh token from cookie)
 */
export const refresh = async (req, res) => {
  try {
    // ✅ Get refresh token from cookie instead of request body
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    // Verify refresh token
    let decoded
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' })
    }

    // Check if token exists in DB and is not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    })

    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token not found' })
    }

    if (storedToken.isRevoked) {
      // Token reuse detected! Revoke all tokens for this user
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken.userId },
        data: { isRevoked: true }
      })
      // ✅ Clear cookies on token reuse
      clearTokenCookies(res)
      return res.status(401).json({ error: 'Token revoked. Please login again.' })
    }

    if (storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' })
    }

    // Check if user still exists
    if (!storedToken.user) {
      return res.status(401).json({ error: 'User not found' })
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

    // ✅ Set new cookies
    setTokenCookies(res, accessToken, newRefreshToken)

    res.json({
      message: 'Tokens refreshed successfully'
      // ❌ NO tokens in response!
    })

  } catch (error) {
    console.error('Refresh error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // ✅ Get refresh token from cookie
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      // Revoke the specific refresh token
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
        data: { isRevoked: true }
      })
    }

    // ✅ Clear cookies
    clearTokenCookies(res)

    res.json({ message: 'Logged out successfully' })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
      return res.status(400).json({ error: 'Invalid or expired verification token' })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    res.json({ message: 'Email verified successfully. You can now login.' })

  } catch (error) {
    console.error('Verify email error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
      message: 'If an account with that email exists, a password reset link has been sent.'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Internal server error' })
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
      return res.status(400).json({ error: 'Invalid or expired reset token' })
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

    // ✅ Clear cookies on password reset
    clearTokenCookies(res)

    res.json({ message: 'Password reset successfully. Please login with your new password.' })

  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}