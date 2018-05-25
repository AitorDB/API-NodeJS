import Joi from 'joi'

import { ApiError } from '../helpers/errors.js'
import Product from '../models/product.js'

/**
 * Show a product data which matches with the id parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function getProduct(req, res, next) {
    const validationSchema = Joi.object().keys({
        id: Joi.number().integer().min(0).required(),
    })

    try {
        const result = Joi.validate({ id: req.params.id }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const product = await Product.get(req.params.id)
        return res.status(200).send(product)
    } catch (err) {
        return next(err)
    }
}

/**
 * Show a product data list
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function getProducts(req, res, next) {
    const validationSchema = Joi.object().keys({
        limit: Joi.number().integer().min(1).max(500),
        page: Joi.number().integer().min(0),
    })

    try {
        const result = Joi.validate({ limit: req.query.limit, page: req.query.page }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const products = await Product.getList(req.query.limit, req.query.page)
        res.status(200).send(products)
    } catch (err) {
        return next(err)
    }
}

/**
 * Add a product to the DB and show it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function addProduct(req, res, next) {
    const validationSchema = Joi.object().keys({
        name: Joi.string().alphanum().required(),
        description: Joi.string(),
        price: Joi.number().precision(2).required(),
        image: Joi.string().uri(),
    })

    try {
        const result = Joi.validate({ name: req.body.name, description: req.body.description, price: req.body.price, image: req.body.image }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const product = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image,
        }

        const addedProduct = await Product.add(product)
        return res.status(200).send(addedProduct)
    } catch (err) {
        return next(err)
    }
}

/**
 * Edit a product which matches with the id parameter and show it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function editProduct(req, res, next) {
    const validationSchema = Joi.object().keys({
        id: Joi.number().integer().min(0).required(),
        name: Joi.string().alphanum(),
        description: Joi.string(),
        price: Joi.number().precision(2),
        image: Joi.string().uri(),
    })

    try {
        const result = Joi.validate({ id: req.params.id, name: req.body.name, description: req.body.description, price: req.body.price, image: req.body.image }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const product = await Product.edit(req.params.id, req.body)
        return res.status(200).send(product)
    } catch (err) {
        next(err)
    }
}

/**
 * Remove a product which matches with the id parameter and show it
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function removeProduct(req, res, next) {
    const validationSchema = Joi.object().keys({
        id: Joi.number().integer().min(0).required(),
    })

    try {
        const result = Joi.validate({ id: req.params.id }, validationSchema)
        if (result.error !== null) throw new ApiError(401, 'Incorrect data')

        const product = await Product.remove(req.params.id)
        res.status(200).send(product)
    } catch (err) {
        return next(err)
    }
}

export default { getProduct, getProducts, addProduct, editProduct, removeProduct }
