import express from 'express'
import RateLimit from 'express-rate-limit'

import UserControllers from '../../../controllers/user.js'
import config from '../../../config'

const router = new express.Router()
router.use(new RateLimit(config.api.rate_limits.AUTH))

// Auth routes
router.post('/signin', UserControllers.signIn)
router.post('/signup', UserControllers.signUp)
router.get('/emailActivation/:token', UserControllers.emailActivation)
router.post('/emailActivation', UserControllers.emailActivationRequest)
router.get('/passwordReset/:token', UserControllers.passwordResetPage)
router.post('/passwordReset/:token', UserControllers.passwordReset)
router.post('/passwordReset', UserControllers.passwordResetRequest)

export default router
