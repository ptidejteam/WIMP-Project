const IdentityChecker = require('./authentication/Identity.checker');
const Authenticator = require('./authentication/authentication.handler');
const Validator = require('./authorization/authorization.validation');


exports.routesConfig = function (app) {
    app.post('/auth', [
        IdentityChecker.hasAuthValidFields,
        IdentityChecker.isPasswordAndUserMatch,
        Authenticator.login
    ]);

    app.post('/refresh', [
        Validator.validJWTNeeded,
        Validator.verifyRefreshBodyField,
        Validator.validRefreshNeeded,
        IdentityChecker.isUserStillExistsWithSamePrivileges,
        Authenticator.refresh_token
    ]);


    app.post('/logout', [
        Validator.validJWTNeeded,
        Authenticator.logout
    ]);
};