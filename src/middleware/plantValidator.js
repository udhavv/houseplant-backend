// middleware/plantValidator.js
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

// Validation rules for updating plant name
export const validatePlantName = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Plant name is required')
    .isLength({ min: 1, max: 30 })
    .withMessage('Plant name must be between 1 and 30 characters')
    .matches(/^[a-zA-Z0-9\s\-_'.]+$/)
    .withMessage('Plant name can only contain letters, numbers, spaces, and basic punctuation (hyphen, underscore, apostrophe, period)'),
  validate
]

// Validation rules for resetting plant
export const validateResetPlant = [
  body('confirmReset')
    .optional()
    .isBoolean()
    .withMessage('confirmReset must be a boolean value (true/false)'),
  validate
]

// Validation rules for getting milestones with pagination
export const validateGetMilestones = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
    .toInt(),
  validate
]

// Validation rules for getting care logs with pagination
export const validateGetCareLogs = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a non-negative integer')
    .toInt(),
  validate
]

// Validation rules for checking plant status
export const validateCheckPlantStatus = [
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('includeDetails must be a boolean value (true/false)')
    .toBoolean(),
  validate
]