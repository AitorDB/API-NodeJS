import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import helmet from 'helmet'
import httpStatus from 'http-status'
import path from 'path'

import routes from './routes'
import logger from './helpers/logger.js'

const app = express()

// Pug
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet())

// Enable CORS
app.use(cors())

// To use with Nginx
// app.enable('trust proxy')

// Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// API Routes
app.use('/', routes)

// Catch 404
app.get('*', (req, res) => {
    res.status(404).send({ message: 'Not found' })
})

// Error log
app.use((err, req, res, next) => {
    logger.log(err.level || 'error', err.message)
    next(err)
})

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).send({
        status: err.status || 500,
        message: err.status ? err.message : httpStatus[500],
    })
})

export default app
