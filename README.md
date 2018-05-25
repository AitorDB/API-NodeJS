# API REST boilerplate

[![node](https://img.shields.io/badge/node-v8.4.0-green.svg?style=flat-square)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-v5.3.0-green.svg?style=flat-square)](https://www.npmjs.com/)
[![mongodb](https://img.shields.io/badge/mongodb-v3.4.6-green.svg?style=flat-square)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/express-v4.15.4-green.svg?style=flat-square)](http://expressjs.com/)
[![MIT License](https://img.shields.io/npm/l/stack-overflow-copy-paste.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Support me](https://img.shields.io/badge/support-paypal-red.svg?style=flat-square)](https://www.paypal.me/ThorDevs)


Boilerplate app to build your own API REST with Node.js, Express and MongoDB.

## Getting Started

```
# Clone this repository
git clone https://github.com/AitorDB/API-NodeJS.git
cd API-NodeJS/

# Install dependencies
npm i

# Execute the config script
# This will set-up your config file
npm run script:config

# Build the project
npm run build

# Execute the db set-up script
# This will create a SuperAdmin user and the default roles
npm run script:db
```

## Start server

```
# Development mode (with nodemon support)
npm run dev

# Production mode
npm start
```

## Config file

* **DEFAULT_PORT**: Port used by default when no ENV port specified
* **api**
    * **SECRET_TOKEN**: JWT Secret
    * **rate_limits**: Rate limit middleware config
        * **AUTH**
        * **PRODUCT**
* **log**: Log files path
    * **ERROR_PATH**
    * **WARN_PATH**
    * **INFO_PATH**
* **db**
    * **URI**: MongoDB connection URI
* **email**
    * **API_KEY**: Sendgrid API key
    * **FROM**: Email which will appear as sender
* **product**
    * **DEFAULT_IMAGE**: Default image url

## Dependencies

* [@sendgrid/mail](https://sendgrid.com/)
* [bcrypt-as-promised](https://github.com/iceddev/bcrypt-as-promised)
* [body-parser](https://github.com/expressjs/body-parser)
* [cors](https://github.com/expressjs/cors)
* [Express](https://expressjs.com/)
* [express-rate-limit](https://github.com/nfriedly/express-rate-limit)
* [helmet](https://helmetjs.github.io/)
* [http-status](https://github.com/adaltas/node-http-status)
* [joi](https://github.com/hapijs/joi)
* [jwt-simple](https://github.com/hokaccha/node-jwt-simple)
* [moment](https://momentjs.com/)
* [mongoose](http://mongoosejs.com/)
* [mz](https://github.com/normalize/mz)
* [pug](https://pugjs.org/)
* [winston](https://github.com/winstonjs/winston)

## Dev-dependencies
* [babel-cli](https://babeljs.io/)
* [babel-eslint](https://github.com/babel/babel-eslint)
* [babel-plugin-add-module-exports](https://github.com/59naga/babel-plugin-add-module-exports)
* [babel-preset-es2015](https://github.com/babel/babel/tree/master/packages/babel-preset-es2015)
* [eslint](https://eslint.org/)
* [eslint-config-google](https://github.com/google/eslint-config-google)
* [eslint-plugin-import](https://github.com/benmosher/eslint-plugin-import)
* [nodemon](https://nodemon.io/)
* [rimraf](https://github.com/isaacs/rimraf)

## License

MIT © [AitorDB](http://aitordb.com/)