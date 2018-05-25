import mongoose from 'mongoose'
import moment from 'moment'
import Role from './role.js'
import { ApiError } from '../helpers/errors.js'
import bcrypt from 'bcrypt-as-promised'

const { Schema } = mongoose

const User = new Schema({
    id: {
        type: Number,
        required: true,
        index: true,
        unique: true,
    },
    name: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        index: true,
        unique: true,
        match: [/^([\w-.]+@([\w-]+.)+[\w-]{2,4})?$/, 'Valid email is required'],
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Number,
        default: moment().unix(),
    },
    lastLogin: {
        type: Number,
        default: moment().unix(),
    },
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Role',
    },
    enabled: {
        type: Boolean,
        default: false,
    },
})

User.pre('save', async function SetDefaultRole(next) {
    if (!this.role) this.role = await Role.getDefault()
    next()
})

User.methods = {
    /**
     * Return an object without sensitive information
     * @return {Object}
     */
    async hideSens() {
        const role = await Role.getRole(this.role)
        const processedUser = {
            id: this.id,
            name: this.name,
            email: this.email,
            role: role.name,
        }

        return processedUser
    },

    /**
     * Check if the password is correct
     * @param {string} password
     * @return {boolean}
     */
    async comparePassword(password) {
        try {
            const equals = await bcrypt.compare(password, this.hashedPassword)
            return equals
        } catch (err) {
            throw new ApiError(400, 'Incorrect data')
        }
    },
}

User.statics = {
    /**
     * Return a user which matches the query 
     * @param {Object} findQuery
     * @return {Object}
     * @exception {ApiError} 
     */
    async get(findQuery) {
        const user = await this.findOne(findQuery)
        if (user) return user

        // I use 400 to avoid send sensitive data
        throw new ApiError(400, 'Incorrect data')
        // throw new ApiError(404, 'User not found')
    },

    /**
     * Return a user which matches the query 
     * @param {Object} user
     * @return {Promise} Return a promise which returns the new user
     */
    async register(user) {
        const check = await this.findOne({ $or: [{ email: user.email }, { name: user.name }] })
        if (check) throw new ApiError(409, 'Email or user already exists')

        const userID = await this.findOne().sort({ id: -1 }).exec()
        const salt = await bcrypt.genSalt()

        const newUser = new this({
            id: userID ? userID.id + 1 : 0,
            name: user.name,
            email: user.email,
            hashedPassword: await bcrypt.hash(user.password, salt),
        })

        return newUser.save()
            .then(() => newUser)
    },

    /**
     * Enable the account
     * @param {number} userID
     * @exception {ApiError} 
     */
    async active(userID) {
        const user = await this.findOneAndUpdate({ id: userID }, { $set: { enabled: true } }, { new: true })
        if (user) return
        throw new ApiError(404, 'User not found')
    },

    /**
     * Enable the account
     * @param {number} userID
     * @param {string} newPassword
     * @exception {ApiError} 
     */
    async changePassword(userID, newPassword) {
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(newPassword, salt)

        const user = await this.findOneAndUpdate({ id: userID }, { $set: { hashedPassword } })
        if (user) return

        // I use 400 to avoid send sensitive data
        throw new ApiError(400, 'Incorrect data')
        // throw new ApiError(404, 'User not found')
    },

    /**
     * Update the lastLogin field
     * @param {number} userID
     * @param {number} date - unix timestamp
     * @exception {ApiError} 
     */
    async updateLastLogin(userID, date) {
        const user = await this.findOneAndUpdate({ id: userID }, { $set: { lastLogin: date } })
        if (user) return

        // I use 400 to avoid send sensitive data
        throw new ApiError(400, 'Incorrect data')
        // throw new ApiError(404, 'User not found')
    },
}

export default mongoose.model('User', User)
