const session = require("express-session");
const {
  minimumPermissionLevelRequired,
} = require("./authorization/authorization.permission");
const {
  validJWTNeeded,
  validRefreshNeeded,
  verifyRefreshBodyField,
} = require("./authorization/authorization.validation");
const config = require("./env.config");

const Surfer = config.permissionLevels.Surfer;
const sessionSecret = config.session;


exports.setupAuthentication = (app, routes) => {
  app.use(
    session({
      secret: sessionSecret,
      resave: true,
      saveUninitialized: true,
      store: new session.MemoryStore(),
    })
  );
  // app.use(keycloak.middleware());
   routes.forEach((route) => {
    if (route.authenticationRequired) {
      app.use(
        route.url,
        !route.refresh
          ? [validJWTNeeded, minimumPermissionLevelRequired(Surfer)]
          : [validJWTNeeded, verifyRefreshBodyField, validRefreshNeeded],
        function (req, res, next) {
          next();
        }
      );
    }
  });
};
