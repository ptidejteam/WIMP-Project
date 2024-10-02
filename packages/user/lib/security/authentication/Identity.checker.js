const IdentityModel = require('../../routes/models/identity.model');
const crypto = require('crypto');
const uuid = require('uuid');
const validityTime = require('../env.config.js').jwtValidityTimeInSeconds;

// Middleware to validate the presence of required fields
exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];
    if (req.body) {
        if (!req.body.username) {
            errors.push('Missing username field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({ errors: errors.join(', ') });
        } else {
            return next();
        }
    } else {
        return res.status(400).send({ errors: 'Missing username and password fields' });
    }
};

// Middleware to validate user credentials and create a token payload
exports.isPasswordAndUserMatch = async (req, res, next) => {
    try {
        const user = await IdentityModel.findByUserName(req.body.username);
        if (!user) {
            return res.status(404).send("User not found, please check the database or contact the admin.");
        }

        const passwordFields = user.password.split('$');
        const salt = passwordFields[0];
        const hash = crypto.scryptSync(req.body.password, salt, 64, { N: 16384 }).toString("base64");

        if (hash === passwordFields[1]) {
            const now = Math.floor(Date.now() / 1000);
            req.body = {
                iss: 'urn:yahia.xyz',
                aud: 'urn:' + (req.get('origin') ? req.get('origin') : "yahia.xyz"),
                sub: user.email,
                name: user.firstName + ' ' + user.lastName,
                userId: user._id,
                roles: user.permissionLevel,
                jti: uuid.v4(),
                iat: now,
                exp: now + validityTime
            };
            return next();
        } else {
            return res.status(400).send({ errors: ['Invalid username or password'] });
        }
    } catch (error) {
        console.error("Error during password and user matching:", error);
        return res.status(500).send({ errors: ['Internal Server Error'] });
    }
};

// Middleware to check if the user still exists with the same privileges
exports.isUserStillExistsWithSamePrivileges = async (req, res, next) => {
    try {
        const user = await IdentityModel.findByEmail(req.body.sub);
        if (!user || !user[0]) {
            return res.status(404).send("User not found, please check the database or contact the admin.");
        }

        req.body.roles = user[0].permissionLevel;
        return next();
    } catch (error) {
        console.error("Error checking user privileges:", error);
        return res.status(500).send({ errors: ['Internal Server Error'] });
    }
};
