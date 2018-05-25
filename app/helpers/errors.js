/**
 * ApiError class
 * @extends Error
 */
class ApiError extends Error {
    /**
     * Create an ApiError
     * @param {number} status - HTTP status code
     * @param {string} message 
     */
    constructor(status, message) {
        super(message)
        this.name = 'ApiError'
        this.status = status
    }
}

export default { ApiError }
