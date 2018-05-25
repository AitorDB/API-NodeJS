const readline = require('readline')
const fs = require('mz/fs')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer))
    })
}

const config = {
    DEFAULT_PORT: 3000,
    api: {
        SECRET_TOKEN: '',
        rate_limits: {
            PRODUCT: {
                windowMs: 20 * 60 * 1000,
                delayMs: 0,
                max: 500,
            },
            AUTH: {
                windowMs: 1 * 60 * 60 * 1000,
                delayAfter: 3,
                delayMs: 3 * 1000,
                max: 10,
            },
        },
    },
    log: {
        ERROR_PATH: 'log/error.log',
        WARN_PATH: 'log/warn.log',
        INFO_PATH: 'log/info.log',
    },
    db: {
        URI: '',
    },
    email: {
        API_KEY: '',
        FROM: '',
    },
    product: {
        DEFAULT_IMAGE: '',
    },
}
async function saveConfig() {
    if (!await fs.exists('./app/')) await fs.mkdir('./app/')
    if (!await fs.exists('./app/config/')) await fs.mkdir('./app/config')

    await fs.writeFile('./app/config/index.js', `export default ${JSON.stringify(config)}`)
}

async function script() {
    console.log('Welcome to the config set-up script')
    console.log('Some fields will be populated with default settings')

    if ((await ask('Do you want to edit the entire config file manually? (y/n): ')).toLowerCase() === 'y') {
        saveConfig()
    } else {
        // api
        config.api.SECRET_TOKEN = await ask('Secret for your tokens: ')

        // db
        config.db.URI = await ask('MongoDB URI: ')

        // email
        config.email.API_KEY = await ask('SendGrid API KEY: ')
        config.email.FROM = await ask('Emails sender: ')

        // product
        config.email.FROM = await ask('Product default image url: ')

        saveConfig()
    }

    return rl.close()
}

script()
