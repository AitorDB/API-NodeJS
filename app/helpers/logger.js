import winston from 'winston'
import config from '../config'

/**
 * Return a winston Logger
 * @param {string} level - Log level: error / warn / info
 * @return {winston.Logger}
 */
function getLogger(level) {
    const logger = new winston.Logger()

    logger.add(winston.transports.Console, {
        colorize: true,
        level: 'debug',
    })

    switch (level) {
        case 'error':
            logger.add(winston.transports.File, {
                name: 'error-file',
                level,
                filename: config.log.ERROR_PATH,
            })
            break
        case 'warn':
            logger.add(winston.transports.File, {
                name: 'warn-file',
                level,
                filename: config.log.WARN_PATH,
            })
            break
        case 'info':
            logger.add(winston.transports.File, {
                name: 'info-file',
                level,
                filename: config.log.INFO_PATH,
            })
            break
        default:
            throw new Error('Invalid log level')
    }

    return logger
}

export default {
    /**
     * Log a message
     * @param {string} level 
     * @param {string} message 
     */
    log(level, message) {
        getLogger(level).log(level, message)
    },
}
