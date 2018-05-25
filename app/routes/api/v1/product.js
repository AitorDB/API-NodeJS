import express from 'express'
import RateLimit from 'express-rate-limit'

import accessControl from '../../../middlewares/access-control.js'
import ProductControllers from '../../../controllers/product.js'
import config from '../../../config'

const router = new express.Router()
router.use(new RateLimit(config.api.rate_limits.PRODUCT))

// Product routes
router.get('/', ProductControllers.getProducts)
router.get('/:id', ProductControllers.getProduct)
router.post('/', accessControl(['ADD_PRODUCT']), ProductControllers.addProduct)
router.put('/:id', accessControl(['EDIT_PRODUCT']), ProductControllers.editProduct)
router.delete('/:id', accessControl(['REMOVE_PRODUCT']), ProductControllers.removeProduct)

export default router
