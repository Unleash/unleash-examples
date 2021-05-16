const unleash = require('unleash-server');

const keycloakAuthHook = require('./keycloak-auth-hook');

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
        customAuthHandler: keycloakAuthHook,
    },
    server: {
        enableRequestLogger: true,
        baseUriPath: '',
    },
    logLevel: 'info',
});