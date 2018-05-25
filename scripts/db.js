require('babel-polyfill')
const mongoose = require('mongoose')
const readline = require('readline')
const fs = require('mz/fs')

mongoose.Promise = global.Promise

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer))
    })
}

async function script() {
    try {
        if (!await fs.exists('./dist')) throw new Error('Run build script')

        const config = require('../dist/config/index.js')
        const Role = require('../dist/models/role.js')
        const User = require('../dist/models/user.js')

        console.log('Welcome to the db set-up script')

        if ((await ask('If the default roles do not exist, they will be created, do you want to continue? (y/n): ')).toLowerCase() === 'y') {
            await mongoose.connect(config.db.URI, { useMongoClient: true })

            // Default normal role
            if (!await Role.findOne({ code: 0 })) {
                console.log('The default user role was not found, creating it...')
                const roleName = await ask('Default role name: ')

                const role = new Role({
                    code: 0,
                    name: roleName,
                    permissions: [],
                })

                await role.save()
            }

            // Default SuperAdmin role
            let superAdminRole = await Role.findOne({ code: -1 })
            if (!superAdminRole) {
                console.log('The default SuperAdmin role was not found, creating it...')
                const roleName = await ask('SuperAdmin role name: ')

                superAdminRole = new Role({
                    code: -1,
                    name: roleName,
                    permissions: [],
                })

                await superAdminRole.save()
            }

            // new SuperAdmin
            const user = {
                name: await ask('New SuperAdmin name: '),
                email: await ask('New SuperAdmin email: '),
                password: await ask('New SuperAdmin password: '),
            }

            const newSuperAdmin = await User.register(user)
            await User.findOneAndUpdate({ id: newSuperAdmin.id }, { $set: { enabled: true, role: superAdminRole._id } })

            console.log('Done!')
            mongoose.connection.close()
        }
    } catch (err) {
        console.error(err.message)
    }

    return rl.close()
}

script()
