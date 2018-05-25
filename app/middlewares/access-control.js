import User from '../models/user.js'
import Role from '../models/role.js'
import { ApiError } from '../helpers/errors.js'
import services from '../services'

/**
 * Return a middleware
 * @param {string} requiredPermission
 * @return {accessControl~accessControlMiddleware}
 */
function accessControl(requiredPermission) {
    /**
     * Check if the user is logged and if it has enough permissions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     * @return {undefined}
     */
    return async function accessControlMiddleware(req, res, next) {
        try {
            if (!req.headers.authorization) throw new ApiError(401, 'Authorization required')

            const token = req.headers.authorization.split(' ')[1]
            const decodedToken = await services.decodeToken(token)
            if (decodedToken.action !== 'API_USE') throw new ApiError(401, 'Wrong token')

            const user = await User.get({ id: decodedToken.sub })
            if (user.lastLogin !== decodedToken.iat) throw new ApiError(401, 'Wrong token')
            // Now jwt-simple checks if the token has expired
            // if (decodedToken.exp < moment().unix()) throw new ApiError(401, 'Expired token')

            // Roles
            // SuperAdmin user has all permissions
            const role = await Role.getRole(user.role)
            if (role.code === -1) return next()
            if (requiredPermission) {
                if (role.permissions.includes(requiredPermission)) return next()
                throw new ApiError(403, 'Not enough permissions')
            }

            return next()
        } catch (err) {
            return next(err)
        }
    }
}

export default accessControl
