import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'


const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  )
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  )
  
  return { accessToken, refreshToken }
}

const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash)
}

const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex')
}


const setTokenCookies = (res, accessToken, refreshToken) => {
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Access Token Cookie (15 min)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,           // ✅ Cannot be accessed by JavaScript
    secure: isProduction,      // ✅ HTTPS only in production
    sameSite: 'lax',          // ✅ CSRF protection
    maxAge: 15 * 60 * 1000,   // 15 minutes
    path: '/',                // Available on all routes
  })

  // Refresh Token Cookie (7 days)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/api/auth/refresh',       // Only sent to refresh endpoint
  })
}

/**
 * Clear token cookies
 */
const clearTokenCookies = (res) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
}

export { generateTokens, hashPassword, comparePassword, generateRandomToken, setTokenCookies, clearTokenCookies };
