const unleash = require('unleash-server');

const enableGoogleOauth = require('./google-auth-hook');

unleash.start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    adminAuthentication: 'custom',
    preRouterHook: enableGoogleOauth,
})
