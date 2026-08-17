// import jwt from 'jsonwebtoken'
// import { prisma } from '../prismaClient.js'

// /**
//  * Authenticate user using JWT access token
//  * Attaches user to req.user
//  */
// export const authenticate = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization
    
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ 
//         error: 'Authentication required. Please provide a valid access token.' 
//       })
//     }

//     const token = authHeader.split(' ')[1]

//     // Verify token
//     let decoded
//     try {
//       decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
//     } catch (error) {
//       if (error.name === 'TokenExpiredError') {
//         return res.status(401).json({ 
//           error: 'Access token expired. Please refresh your token.',
//           code: 'TOKEN_EXPIRED'
//         })
//       }
//       return res.status(401).json({ 
//         error: 'Invalid access token. Please login again.' 
//       })
//     }

//     // Get user from database
//     const user = await prisma.user.findUnique({
//       where: { id: decoded.userId },
//       select: {
//         id: true,
//         email: true,
//         username: true,
//         isEmailVerified: true,
//         createdAt: true
//       }
//     })

//     if (!user) {
//       return res.status(401).json({ error: 'User not found. Please login again.' })
//     }

//     // Check if email is verified (skip for verification routes)
//     if (!user.isEmailVerified && !req.path.includes('/verify-email')) {
//       return res.status(403).json({ 
//         error: 'Please verify your email before proceeding.',
//         code: 'EMAIL_NOT_VERIFIED'
//       })
//     }

//     // Attach user to request
//     req.user = user
//     req.userId = user.id

//     next()
//   } catch (error) {
//     console.error('Auth middleware error:', error)
//     res.status(500).json({ error: 'Internal server error' })
//   }
// }

// /**
//  * Optional auth middleware - doesn't block if no token
//  */
// export const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization
    
//     if (authHeader && authHeader.startsWith('Bearer ')) {
//       const token = authHeader.split(' ')[1]
      
//       try {
//         const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
//         const user = await prisma.user.findUnique({
//           where: { id: decoded.userId },
//           select: { id: true, email: true, username: true }
//         })
//         if (user) {
//           req.user = user
//           req.userId = user.id
//         }
//       } catch (error) {
//         // Invalid token - just continue as unauthenticated
//       }
//     }
//     next()
//   } catch (error) {
//     next()
//   }
// }





import jwt from 'jsonwebtoken'
import { prisma } from '../prismaClient.js'

/**
 * Authenticate user using JWT access token from cookie or header
 * Attaches user to req.user
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = null

    // 1. Try to get token from cookie first (web app)
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    }
    
    // 2. If no cookie, try Authorization header (mobile/API clients)
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required. Please provide a valid access token.' 
      })
    }

    // Verify token
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Access token expired. Please refresh your token.',
          code: 'TOKEN_EXPIRED'
        })
      }
      return res.status(401).json({ 
        error: 'Invalid access token. Please login again.' 
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
        createdAt: true
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found. Please login again.' })
    }

    // Check if email is verified (skip for verification routes)
    if (!user.isEmailVerified && !req.path.includes('/verify-email')) {
      return res.status(403).json({ 
        error: 'Please verify your email before proceeding.',
        code: 'EMAIL_NOT_VERIFIED'
      })
    }

    // Attach user to request
    req.user = user
    req.userId = user.id

    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

/**
 * Optional auth middleware - doesn't block if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token = null

    // Try cookie first
    if (req.cookies?.accessToken) {
      token = req.cookies.accessToken
    }
    
    // Try header
    if (!token) {
      const authHeader = req.headers.authorization
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1]
      }
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, username: true }
        })
        if (user) {
          req.user = user
          req.userId = user.id
        }
      } catch (error) {
        // Invalid token - just continue as unauthenticated
      }
    }
    next()
  } catch (error) {
    next()
  }
}