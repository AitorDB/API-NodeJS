import moment from 'moment'
import jwt from 'jwt-simple'
import sendgrid from '@sendgrid/mail'
import pug from 'pug'
import path from 'path'

import User from '../models/user.js'
import { ApiError } from '../helpers/errors.js'
import config from '../config'

sendgrid.setApiKey(config.email.API_KEY)

/**
 * Return a JSON Web Token and update the user lastLogin
 * @param {User} user
 * @param {string} action - jwt action: API_USE / EMAIL_ACTIVATION / PASSWORD_RESET
 * @return {string}
 */
async function createToken(user, action) {
    let payload
    const date = moment().unix()

    switch (action) {
        case 'API_USE':
            payload = {
                sub: user.id,
                iat: date,
                exp: date + moment.duration(14, 'days').asSeconds(),
                action,
            }
            break
        case 'EMAIL_ACTIVATION':
            payload = {
                sub: user.id,
                iat: date,
                exp: date + moment.duration(15, 'minutes').asSeconds(),
                action,
            }
            break
        case 'PASSWORD_RESET':
            payload = {
                sub: user.id,
                iat: date,
                exp: date + moment.duration(5, 'minutes').asSeconds(),
                action,
            }
            break
        default:
            throw new Error('Invalid action')
    }

    const token = jwt.encode(payload, config.api.SECRET_TOKEN)
    await User.updateLastLogin(user.id, date)
    return token
}

/**
 * Return the token payload
 * @param {string} token
 * @return {Object} 
 */
async function decodeToken(token) {
    try {
        const decodedToken = await jwt.decode(token, config.api.SECRET_TOKEN)
        return decodedToken
    } catch (err) {
        // Now jwt-simple checks if the token has expired
        if (err.message === 'Token expired') throw new ApiError(401, 'Expired token')
        throw new ApiError(401, 'Wrong token')
    }
}

/**
 * Send an email to the user with a link to activate its account
 * @param {User} user 
 * @param {string} subject 
 * @param {string} pugFile 
 * @param {Object} messageOptions
 */
async function sendEmail(user, subject, pugFile, messageOptions) {
    const message = {
        to: user.email,
        from: config.email.FROM,
        subject,
        html: pug.renderFile(path.join(__dirname, pugFile), messageOptions),
    }
    sendgrid.send(message)
}

export default { createToken, decodeToken, sendEmail }
