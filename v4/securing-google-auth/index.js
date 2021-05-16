const unleash = require('unleash-server');

const enableGoogleOauth = require('./google-auth-hook');

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
        customAuthHandler: enableGoogleOauth,
    },
    server: {
        enableRequestLogger: true,
        baseUriPath: '',
    },
    logLevel: 'info',
});