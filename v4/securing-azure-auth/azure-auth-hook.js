/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */

'use strict';

/**
 * Azure AD hook for securing an Unleash server
 *
 * This example assumes that all users authenticating via
 * azure should have access. You would probably limit access
 * to users you trust, for example users within a tenant.
 *
 * The implementation assumes the following environment variables:
 *
 *  - AUTH_HOST
 *  - AUTH_CLIENT_ID
 *  - AUTH_CLIENT_SECRET
 *  - AUTH_TENANT_ID
 */

const unleash = require('unleash-server');
const passport = require('@passport-next/passport');
const OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

const host = process.env.AUTH_HOST;
const clientID = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const tenantID = process.env.AUTH_TENANT_ID;

function azureAdminOauth(app, config, services) {
  const { baseUriPath } = config.server;
  const { userService } = services;

  passport.use(
    'azure',
    // Check passport azure ad documentation for option details: https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/maintenance/passport-azure-ad#4112-options
    new OIDCStrategy(
      {
        identityMetadata: `https://login.microsoftonline.com/${tenantID}/v2.0/.well-known/openid-configuration`,
        clientID,
        clientSecret,
        redirectUrl: `${host}/api/auth/callback`,
        responseType: 'code',
        responseMode: 'query',
        scope: ['openid', 'email'],
        allowHttpForRedirectUrl: true,
      },
      async (iss, sub, profile, accessToken, refreshToken, cb) => {
        const user = await userService.loginUserWithoutPassword(
          profile._json.email,
          true
        );
        cb(null, user);
      }
    )
  );

  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.get(
    '/auth/azure/login',
    passport.authenticate('azure', { scope: ['email'] })
  );
  app.get(
    '/api/auth/callback',
    passport.authenticate('azure', {
      failureRedirect: '/api/admin/error-login',
    }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.use('/api', (req, res, next) => {
    if (req.user) {
      next();
    } else {
      return res
        .status(401)
        .json(
          new unleash.AuthenticationRequired({
            path: '/auth/azure/login',
            type: 'custom',
            message: `You have to identify yourself in order to use Unleash. Click the button and follow the instructions.`,
          })
        )
        .end();
    }
  });
}

module.exports = azureAdminOauth;
