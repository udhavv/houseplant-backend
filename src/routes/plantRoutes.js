// import express from 'express'
// import {
//   fetchPlantState,
//     waterPlant,
//     resetPlant
// } from '../controllers/plantController.js'
// import {
//   validateRegister,
//   validateLogin,
//   validateForgotPassword,
//   validateResetPassword,
//   validateRefreshToken
// } from '../middleware/validators.js'
// import { authenticate } from '../middleware/auth.js'

// const router = express.Router()

// // Public routes
// router.get('/', authenticate, fetchPlantState)
// router.post('/water', authenticate, waterPlant)
// router.post('/reset', authenticate, resetPlant)

// // Private routes

// export default router

// routes/plantRoutes.js
import express from 'express'
import { authenticate } from '../middleware/auth.js'
import {
  fetchPlantState,
  waterPlant,
  fertilizePlant,
  repotPlant,
  resetPlant,
  getPlantMilestones,
  getPlantCareLogs,
  updatePlantName,
  checkPlantStatus,
  prunePlant
} from '../controllers/plantController.js'
import {
  validatePlantName,
  validateResetPlant,
  validateGetMilestones,
  validateGetCareLogs,
  validateCheckPlantStatus
} from '../middleware/plantValidator.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Plant state
router.get('/state', fetchPlantState)
router.get('/status', validateCheckPlantStatus, checkPlantStatus)

// Plant actions
router.post('/water', waterPlant)
router.post('/fertilize', fertilizePlant)
router.post('/prune', prunePlant)
router.post('/repot', repotPlant)
router.post('/reset', validateResetPlant, resetPlant)
router.put('/name', validatePlantName, updatePlantName)

// Plant history
router.get('/milestones', validateGetMilestones, getPlantMilestones)
router.get('/care-logs', validateGetCareLogs, getPlantCareLogs)

export default router

