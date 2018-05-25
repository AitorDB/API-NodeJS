import mongoose from 'mongoose'
import { ApiError } from '../helpers/errors.js'

const { Schema } = mongoose
const Role = new Schema({
    code: {
        type: Number,
        index: true,
        unique: true,
    },
    name: String,
    permissions: [String],
})

Role.methods = {
    /**
     * Return an object without sensitive information
     * @return {Object}
     */
    hideSens() {
        return {
            code: this.code,
            name: this.name,
            permissions: this.permissions,
        }
    },
}

Role.statics = {
    /**
     * Return the role _id with code 0
     * @return {Schema.Types.ObjectId}
     */
    async getDefault() {
        try {
            const role = await this.findOne({ code: 0 })
            if (role) return role._id
            throw new Error('The API require a role with code 0')
        } catch (error) {
            // eslint-disable-next-line
            console.error(error.message)
            process.exit(1)
        }
    },

    /**
     * Return a role which matches the _id 
     * @param {Schema.Types.ObjectId} id
     * @return {Object}
     * @exception {ApiError} 
     */
    async getRole(id) {
        const role = await this.findById(id)
        if (role) return role.hideSens()
        throw new ApiError(404, 'Not role found')
    },
}

export default mongoose.model('Role', Role)
