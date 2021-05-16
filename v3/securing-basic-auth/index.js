const unleash = require('unleash-server');

const basicAuth = require('./basic-auth-hook');

unleash.start({
    databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
    adminAuthentication: 'custom',
    preRouterHook: basicAuth,
});