import mongoose from 'mongoose'
import config from '../config'
import { ApiError } from '../helpers/errors.js'

const { Schema } = mongoose
const Product = new Schema({
    id: {
        type: Number,
        required: true,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        trim: true,
        default: config.product.DEFAULT_IMAGE,
    },
})

Product.methods = {
    /**
     * Return an object without sensitive information
     * @return {Object}
     */
    hideSens() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            price: this.price,
            image: this.image,
        }
    },
}

Product.statics = {
    /**
     * Return a product which matches the id 
     * @param {number} id
     * @return {Object}
     * @exception {ApiError} 
     */
    async get(id) {
        const product = await this.findOne({ id })
        if (product) return product.hideSens()
        throw new ApiError(404, 'Product not found')
    },

    /**
     * Return a list of products
     * @param {number} limit - Default: 100
     * @param {number} skip - Default: 0
     * @return {Array.<Object>}
     * @exception {ApiError}
     */
    async getList(limit = 100, skip = 0) {
        const products = await this.find().limit(parseInt(limit)).skip(parseInt(skip)).exec()
        if (products) return products.map((product) => product.hideSens())
        throw new ApiError(404, 'Not products found')
    },

    /**
     * Add a product to the database and return it
     * @param {Object} product 
     * @return {Promise} Return a promise which returns the new product
     */
    async add(product) {
        const productID = await this.findOne().sort({ id: -1 }).exec()
        const newProduct = new this({
            id: productID ? productID.id + 1 : 0,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
        })

        return newProduct.save()
            .then(() => newProduct.hideSens())
    },

    /**
     * Edit the fields contained in the update Object and return it
     * @param {number} id
     * @param {Object} update
     * @return {Object}
     * @exception {ApiError}
     */
    async edit(id, update) {
        const product = await this.findOneAndUpdate({ id }, update, { new: true })
        if (product) return product.hideSens()
        throw new ApiError(404, 'Product not found')
    },

    /**
     * Remove the product and return it
     * @param {number} id
     * @return {Object}
     * @exception {ApiError}
     */
    async remove(id) {
        const product = await this.findOneAndRemove({ id })
        if (product) return product.hideSens()
        throw new ApiError(404, 'Product not found')
    },
}

export default mongoose.model('Product', Product)
