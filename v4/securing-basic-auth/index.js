const unleash = require('unleash-server');

const basicAuth = require('./basic-auth-hook');

unleash.start({
    db: {
        user: 'unleash_user',
        password: 'passord',
        host: 'localhost',
        port: 5432,
        database: 'unleash',
        ssl: false,
    },
    authentication: {
        type: 'custom',
        customAuthHandler: basicAuth,
    },
    server: {
        enableRequestLogger: true,
        baseUriPath: '',
    },
    logLevel: 'info',
});