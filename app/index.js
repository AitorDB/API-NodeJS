import mongoose from 'mongoose'
import app from './app.js'
import config from './config'

// Asign Node promises to mongoose
// mongoose's default promise library is deprecated
mongoose.Promise = global.Promise

/**
 * Starts the DB connection and start to listen the indicated port
 */
async function startServer() {
    await mongoose.connect(config.db.URI, { useMongoClient: true })
    app.listen(process.env.PORT || config.DEFAULT_PORT)
}

startServer()
