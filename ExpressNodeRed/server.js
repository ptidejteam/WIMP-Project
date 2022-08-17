// ----------- IMPORTS -----------

// Imports for JSON database management
let JSONdb = require('simple-json-db');

// Imports for Web Server management
var http = require('http');
var express = require("express");
const bodyParser = require('body-parser');
var path = require('path');

// Import for Node-RED management
var RED = require("node-red");

// Import for Mustache management
const mustacheExpress = require('mustache-express');

// Import dotvenv file
require('dotenv').config();
const config = process.env;
let frontendUrl = "";
let backendUrl = "";
if (config.ENV === "dev") {
    frontendUrl = config.FRONTEND_HOST + ":" + config.FRONTEND_PORT;
    backendUrl = config.BACKEND_HOST + ":" + config.BACKEND_PORT;
} else if (config.ENV === "prod") {
    frontendUrl = config.FRONTEND_HOST;
    backendUrl = config.BACKEND_HOST;
}

// Other Imports
const fs = require('fs');
const bcrypt = require('bcrypt');

// Import custom modules
const apiRouter = require('./modules/apiRouter');

// -------------------------------

// Initialize the Express server
var app = express();
var server = http.createServer(app);

app.use(function (req, res, next) {
  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET', 'POST');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  res.setHeader('Access-Control-Allow-Origin', config.PROTOCOL + '://' + frontendUrl);
  // Pass to next layer of middleware
  next();    
});


// Body parser middleware config
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }))
app.use(bodyParser.json({ limit: '50mb' }))

// Use custom modules
app.use('/api', apiRouter);

// Passport Session config
// -------------------------------
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy

app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000,
        sameSite: 'strict',
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    (username, password, done) => {
        let db_auth = new JSONdb('./database/credentials.json');
        let reel_password = db_auth.get(username);

        if (reel_password != password){
            console.log('\x1b[31m%s\x1b[0m', 'Failed to authorize : ' + username);
            return done(null, false);
        } 
        else{
            console.log('\x1b[32m%s\x1b[0m', 'Authorized : ' + username);
            let authenticated_user = { "id": username};
            return done (null, authenticated_user);
        }  
    }
));

passport.serializeUser( (userObj, done) => {
    done(null, userObj)
});

passport.deserializeUser((userObj, done) => {
    done (null, userObj)
});

checkAuthenticated = (req, res, next) => {
    console.log("Authenticating for access to " + req.originalUrl + "...")
    if (req.isAuthenticated()) { 
        console.log("Authentication done for access to " + req.originalUrl);
        return next(); 
    }
    res.redirect("/login");
}

// -------------------------------


// Rate limiter config
// -------------------------------
const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible')

// create a Redis client
const redisClient = redis.createClient(process.env.REDIS_URL, {
    enable_offline_queue: false
});
  
// if no connection, an error will be emitted
// handle connection errors
redisClient.on('error', err => {
    console.log(err);
    // this error is handled by an error handling function that will be explained later in this tutorial
    return new Error();
});

const maxWrongAttemptsByIPperMinute = 5;
const maxWrongAttemptsByIPperDay = 100;

const limiterFastBruteByIP = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'login_fail_ip_per_minute',
    points: maxWrongAttemptsByIPperMinute,
    duration: 30,
    blockDuration: 60 * 10, // Block for 10 minutes, if 5 wrong attempts per 30 seconds
});
  
const limiterSlowBruteByIP = new RateLimiterRedis({
    redis: redisClient,
    keyPrefix: 'login_fail_ip_per_day',
    points: maxWrongAttemptsByIPperDay,
    duration: 60 * 60 * 24,
    blockDuration: 60 * 60 * 24, // Block for 1 day, if 100 wrong attempts per day
});
  
rateLimiterAuthenticator = async function(req, res, next) {
    const ipAddress = req.connection.remoteAddress;

    const [resFastByIP, resSlowByIP] = await Promise.all([
        limiterFastBruteByIP.get(ipAddress),
        limiterSlowBruteByIP.get(ipAddress),
    ]);

    let retrySecs = 0;

    // Check if IP is already blocked
    if (resSlowByIP !== null && resSlowByIP.consumedPoints > maxWrongAttemptsByIPperDay) {
        retrySecs = Math.round(resSlowByIP.msBeforeNext / 1000) || 1;
    } else if (resFastByIP !== null && resFastByIP.consumedPoints > maxWrongAttemptsByIPperMinute) {
        retrySecs = Math.round(resFastByIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
        res.set('Retry-After', String(retrySecs));
        res.status(429).send('Please wait before retrying.');
    } else {
        passport.authenticate('local', async function(err, user) {
            if (err) {
                return next(err);
            }

            // If passeport authentication fails, increment the counter
            if (!user) {
                // Consume 1 point from limiters on wrong attempt and block if limits reached
                try {
                    await Promise.all([
                        limiterFastBruteByIP.consume(ipAddress),
                        limiterSlowBruteByIP.consume(ipAddress),
                    ]);
                    res.status(401).send("Invalid Credentials");
                } catch (rlRejected) {
                    if (rlRejected instanceof Error) {
                        throw rlRejected;
                    } else {
                        const timeOut =
                        String(Math.round(rlRejected.msBeforeNext / 1000)) || 1;

                        seconds = timeOut;
                        minutes = Math.floor(seconds / 60);
                        seconds = seconds % 60;
                        hours = Math.floor(minutes / 60);
                        minutes = minutes % 60;
                        days = Math.floor(hours / 24);
                        hours = hours % 24;

                        let timeoutMessage = "Too many login attempts. Retry after";

                        if (days > 0) { timeoutMessage += " " + days + " days"; }
                        if (hours > 0) { timeoutMessage += " " + hours + " hours"; }
                        if (minutes > 0) { timeoutMessage += " " + minutes + " minutes"; }
                        if (seconds > 0) { timeoutMessage += " " + seconds + " seconds"; }

                        res.set('Retry-After', timeOut);
                        res.status(429).send(timeoutMessage);
                    }
                }
            }

            // If passport authentication successful
            if (user) {
                // login (Passport.js method)
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    return next();
                });
            }
          })(req, res, next);
    }
}
// -------------------------------


// CSRF Protection config
// -------------------------------
let csrf = require('csurf');
let cookieParser = require('cookie-parser')
let csrfProtection = csrf({ cookie: true });
app.use(cookieParser());
// -------------------------------


// Node-RED config
var settings = {
    httpAdminRoot:"/red", // base url to access the Node-RED web interface
    httpNodeRoot: "/node", // base url to access endpoints in the flows
    userDir: path.resolve("../flows/"),
    flowFile:'flows.json',
    editorTheme: {
        tours: false, // To disable the welcome tour
    },
    functionGlobalContext: { }    // enables global context
};


nodeRedAccess = (req, res, next) => {
    const endpoints = config.EXTERNAL_DEVICES_ROUTES.split(',');
    console.log("Node-RED Security check for " + req.originalUrl + "...");

    if (endpoints.includes(req.originalUrl)) {
        console.log('\x1b[32m%s\x1b[0m', "Node-RED Security Exception Accepted for " + req.originalUrl);
        return next();
    }
    
    const backendRestrictedAccess = config.BACKEND_RESTRICTED_ACCESS.split(',');
    if (backendRestrictedAccess.includes(req.originalUrl)) {
        try {
            if (bcrypt.compareSync(req.body.password, config.NODE_RED_SECRET_ENC)) {
                console.log('\x1b[32m%s\x1b[0m', "Backend restricted access for " + req.originalUrl);
                req.body = {};
                return next();
            };
        } catch (e) {
            console.log(e);
        }
    }
    
    console.log('\x1b[31m%s\x1b[0m', "Node-RED Security Exception Rejected for " + req.originalUrl);
    res.redirect("/login");
}

nodeRedAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.user = {
            "anonymous":true,
            "permissions": "*"
        }
    }
    return next();
}

RED.init(server, settings);
app.use(settings.httpNodeRoot, nodeRedAccess, RED.httpNode);
app.use(settings.httpAdminRoot, checkAuthenticated, nodeRedAuthentication, RED.httpAdmin);

// Mustache config
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/pages');

// Static files config
app.use(express.static(__dirname + '/static'));

// API Routes
app.get('/login', csrfProtection, async (req,res) => {
    res.render(path.resolve('./pages/login.html'), {
        "protocol": config.PROTOCOL,
        "frontendUrl": frontendUrl,
        "backendUrl": backendUrl,
        "csrfToken": req.csrfToken()
    });
})

app.post('/login',
    csrfProtection,
    rateLimiterAuthenticator,
    async (req, res) => {
        res.redirect('/profile/' + req.user.id);
    }
);

app.post('/logout', csrfProtection, function(req, res){
    req.logout(function(err) {
    if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get('/myflow', csrfProtection, checkAuthenticated, async(req,res)=>{
    const id = req.user.id;
    console.log("ID : " + id);
    try {
        const rawFlows = fs.readFileSync(__dirname + '/../flows/flows.json');
        const flows = JSON.parse(rawFlows);
        const flow = flows.find(it => ((it.type === "subflow") && (it.name === id)));
        res.json({id: flow.id}).status(200);
    }
    catch (e) {
        res.status(404).send(e);
    }
    return res;
});

app.get('/profile/:id', csrfProtection, checkAuthenticated,
    async (req,res,next)=>{
        if (req.params.id !== req.user.id){ //the id in the url ==== the id of the session
            res
            .send('Action forbidden: You can only access your own profile.')
            .status(403);
        }
        else {
            return next();
        }
    },
    async (req,res)=>{
        const db_staff = new JSONdb('./database/staff.json');
        var teacher = await db_staff.get(req.params.id);
        Object.keys(teacher.states).forEach(key => {
            teacher.states[key].id = key;
        });

        res.render(path.resolve('./pages/profile.html'), {
            "pp": teacher.pp, 
            "name": teacher.firstName + " " + teacher.lastName,
            "states": Object.values(teacher.states),
            "id": req.params.id,
            "default": teacher.default,
            "tracking": teacher.tracking,
            "protocol": config.PROTOCOL,
            "backendUrl": backendUrl,
            "frontendUrl": frontendUrl,
            "csrfToken": req.csrfToken()
        }); 
    }
);

app.post('/update-states', csrfProtection, checkAuthenticated, function(req, res) {
    const id = req.user.id;
    const states = req.body.states;
    const defaults = req.body.default;
    let db_staff = new JSONdb('./database/staff.json');
    if (!db_staff.has(id)) {
        res.send("No user found").status(404);
    }
    else {
        const user = db_staff.get(id);
        user.states = states;
        user["default"] = defaults;
        db_staff.set(id, user);
        res.json({"Update": "OK"}).status(200);
    }
    return res;
});


app.post('/tracker/update', csrfProtection, checkAuthenticated, function(req, res) {
    const id = req.user.id;
    const state = req.body.state;
    let db_staff = new JSONdb('./database/staff.json');
    if (!db_staff.has(id)) {
        res.send("No user found").status(404);
    }
    else {
        const user = db_staff.get(id);
        user.tracking = state;
        db_staff.set(id, user);
        res.json({new: state}).status(200);
    }
    return res;
});

app.get('/', checkAuthenticated, (req,res) => {
    res.redirect("/profile/" + req.user.id);
});

app.get('/error/:code', async(req,res)=>{
    const code = req.params.code;
    const message = req.query.msg || "An error has occurred. Please report it to an administrator.";
    res.render(path.resolve('./pages/error.html'), {
        "code": code,
        "msg": message
    });
});

app.all('*', function(req, res){
    res.redirect("/error/404?msg=Page not found.");
});

// Start the server
console.log('\x1b[33m%s\x1b[0m', "Starting server on port " + config.BACKEND_PORT + "...");
console.log("");
server.listen(config.BACKEND_PORT);

// Start the Node-RED runtime
console.log('\x1b[33m%s\x1b[0m', "Starting Node-RED runtime...");
RED.start();
