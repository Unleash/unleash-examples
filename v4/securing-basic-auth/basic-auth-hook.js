const auth = require('basic-auth');

function basicAuthentication(app, config, services) {
    const { baseUriPath } = config.server;
    const { userService } = services;

    app.use(`${baseUriPath}/api/admin/user`, async (req, res, next) => {
        if(req.user) {
            return next();
        }
        if(req.session.user) {
            req.user = req.session.user;
            return next();
        }

        return res
            .status('401')
            .set({ 'WWW-Authenticate': 'Basic realm="example"' })
            .end('access denied');
    });

    app.use(`${baseUriPath}/`, async (req, res, next) => {
        const credentials = auth(req);

        if (credentials) {
            const email = `${credentials.name}@domain.com`;
            const user = await userService.loginUserWithoutPassword(email, true);
            req.user = user;
            req.session.user = user;
            return next();
        }

        return res
            .status('401')
            .set({ 'WWW-Authenticate': 'Basic realm="example"' })
            .end('access denied');
    });
}

module.exports = basicAuthentication;
