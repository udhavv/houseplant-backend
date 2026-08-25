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
  prunePlant,
  repotPlant,
  resetPlant,
  getPlantMilestones,
  getPlantCareLogs,
  updatePlantName,
  checkPlantStatus
} from '../controllers/plantController.js'

const router = express.Router()

// All routes require authentication
router.use(authenticate)

// Plant state
router.get('/state', authenticate, fetchPlantState)
router.get('/status', authenticate, checkPlantStatus)

// Plant actions
router.post('/water', authenticate, waterPlant)
router.post('/fertilize', authenticate, fertilizePlant)
router.post('/prune', authenticate, prunePlant)
router.post('/repot', authenticate, repotPlant)
router.post('/reset', authenticate, resetPlant)
router.put('/name', authenticate, updatePlantName) 

// Plant history
router.get('/milestones', authenticate, getPlantMilestones)
router.get('/care-logs', authenticate, getPlantCareLogs)

export default router

