// validators/shopValidator.js
import { body, query, validationResult } from 'express-validator'

// Custom validation middleware to check results
export const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
      message: 'Validation failed',
      error: errors.array()[0].msg
    })
  }
  next()
}

// Validation rules for getting user balance
export const validateGetBalance = [
  // No body or query params needed, but we can validate if needed
  validate
]

// Validation rules for daily check-in
export const validateDailyCheckin = [
  // Optional: Check if there's any additional data needed for check-in
  body('timezone')
    .optional()
    .isString()
    .withMessage('Timezone must be a string')
    .isLength({ max: 50 })
    .withMessage('Timezone must be less than 50 characters'),
  validate
]

// Validation rules for buying a pot
export const validateBuyPot = [
  body('potType')
    .trim()
    .notEmpty()
    .withMessage('Pot type is required')
    .isString()
    .withMessage('Pot type must be a string')
    .isIn(['basic', 'ceramic', 'golden'])
    .withMessage('Pot type must be one of: basic, ceramic, or golden')
    .custom((value) => {
      // Additional validation if needed
      const validPotTypes = ['basic', 'ceramic', 'golden']
      if (!validPotTypes.includes(value)) {
        throw new Error('Invalid pot type selected')
      }
      return true
    }),
  validate
]

// Validation rules for checking shop items
export const validateGetShopItems = [
  query('category')
    .optional()
    .isString()
    .withMessage('Category must be a string')
    .isIn(['pots', 'accessories', 'seeds'])
    .withMessage('Category must be one of: pots, accessories, or seeds'),
  validate
]