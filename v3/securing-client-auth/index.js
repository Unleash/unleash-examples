const unleash = require('unleash-server');

// You typically will not hard-code this value in your code!
const sharedSecret = '12312Random';

unleash
    .start({
        databaseUrl: 'postgres://unleash_user:passord@localhost:5432/unleash',
        preRouterHook: app => {
            app.use('/api/client', (req, res, next) => {
                if (req.header('authorization') === sharedSecret) {
                    next();
                } else {
                    res.sendStatus(401);
                }
            });
        },
    });
