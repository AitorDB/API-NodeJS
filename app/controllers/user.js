import Joi from 'joi'

import User from '../models/user.js'
import services from '../services'
import { ApiError } from '../helpers/errors.js'

/**
 * Login and return user data with the access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function signIn(req, res, next) {
    const validationSchema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    try {
        const result = Joi.validate({ email: req.body.email, password: req.body.password }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        let user = await User.get({ email: req.body.email })
        if (!user.enabled) throw new ApiError(403, 'User account is not enabled')

        const correctPassword = await user.comparePassword(req.body.password)
        if (!correctPassword) throw new ApiError(400, 'Incorrect data')

        user = await user.hideSens()
        user.token = await services.createToken(user, 'API_USE')
        return res.status(200).send(user)
    } catch (err) {
        next(err)
    }
}

/**
 * Register, send and activation email and show user data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function signUp(req, res, next) {
    const validationSchema = Joi.object().keys({
        name: Joi.string().alphanum().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    })

    try {
        const result = Joi.validate({ name: req.body.name, email: req.body.email, password: req.body.password }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const user = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        }

        let savedUser = await User.register(user)
        savedUser = await savedUser.hideSens()

        const token = await services.createToken(savedUser, 'EMAIL_ACTIVATION')
        await services.sendEmail(savedUser, 'Account activation', '../views/email/email-activation.pug', { token })
        return res.status(200).send(savedUser)
    } catch (err) {
        next(err)
    }
}

/**
 * Active an user account
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function emailActivation(req, res, next) {
    try {
        const decodedToken = await services.decodeToken(req.params.token)
        const user = await User.get({ id: decodedToken.sub })

        if (user.enabled) throw new ApiError(400, 'User account is already enabled')

        if (decodedToken.action !== 'EMAIL_ACTIVATION') throw new ApiError(401, 'Wrong token')
        if (decodedToken.iat !== user.lastLogin) throw new ApiError(401, 'Wrong token')
        // Now jwt-simple checks if the token has expired
        // if (decodedToken.exp < moment().unix()) throw new ApiError(401, 'Expired token')

        await User.active(user.id)
        return res.status(200).send({ message: 'Account enabled' })
    } catch (err) {
        return next(err)
    }
}

/**
 * Send an activation email to the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function emailActivationRequest(req, res, next) {
    const validationSchema = Joi.object().keys({
        email: Joi.string().email().required(),
    })

    try {
        const result = Joi.validate({ email: req.body.email }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const user = await User.get({ email: req.body.email })
        if (user.enabled) throw new ApiError(400, 'User account is already enabled')

        const token = await services.createToken(user, 'EMAIL_ACTIVATION')
        await services.sendEmail(user, 'Account activation', '../views/email/email-activation.pug', { token })
        return res.status(200).send({ message: 'Email sent' })
    } catch (err) {
        return next(err)
    }
}

/**
 * Change the user password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function passwordReset(req, res, next) {
    try {
        const decodedToken = await services.decodeToken(req.params.token)
        const user = await User.get({ id: decodedToken.sub })

        if (decodedToken.action !== 'PASSWORD_RESET') throw new ApiError(401, 'Wrong token')
        if (decodedToken.iat !== user.lastLogin) throw new ApiError(401, 'Wrong token')
        // Now jwt-simple checks if the token has expired
        // if (decodedToken.exp < moment().unix()) throw new ApiError(401, 'Expired token')

        await User.changePassword(decodedToken.sub, req.body.password)
        return res.status(200).send({ message: 'Password changed' })
    } catch (err) {
        return next(err)
    }
}

/**
 * Send a password reset email to the user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
async function passwordResetRequest(req, res, next) {
    const validationSchema = Joi.object().keys({
        email: Joi.string().email().required(),
    })

    try {
        const result = Joi.validate({ email: req.body.email }, validationSchema)
        if (result.error !== null) throw new ApiError(400, 'Incorrect data')

        const user = await User.get({ email: req.body.email })
        const token = await services.createToken(user, 'PASSWORD_RESET')
        await services.sendEmail(user, 'Password reset', '/../views/email/password-reset.pug', { token })
        res.status(200).send({ message: 'Email sent' })
    } catch (err) {
        return next(err)
    }
}

/**
 * Render a page with a form to change the password
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @return {undefined}
 */
function passwordResetPage(req, res, next) {
    const validationSchema = Joi.object().keys({
        token: Joi.string().regex(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/).min(5),
    })

    try {
        const result = Joi.validate({ token: req.params.token }, validationSchema)
        if (result.error !== null) throw new ApiError(401, 'Invalid token')

        return res.render('password', { token: req.params.token })
    } catch (err) {
        return next(err)
    }
}

export default { signIn, signUp, emailActivation, emailActivationRequest, passwordReset, passwordResetRequest, passwordResetPage }
