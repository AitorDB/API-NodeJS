import express from 'express'
import auth from './auth.js'
import product from './product.js'

const router = new express.Router()
router.use('/auth', auth)
router.use('/product', product)

export default router
