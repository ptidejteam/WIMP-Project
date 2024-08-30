// ----------- IMPORTS -----------

// Imports for JSON database management (authentication only)
const dbjson = require('simple-json-db');

// Imports for Web Server management
const express = require('express');

// Import for Mustache management
const mustacheExpress = require('mustache-express');
const request = require('request');

const bodyParser = require('body-parser');

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

// import passport
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy


// Other Imports
var path = require('path');

// Import custom modules
const prmsRequest = require('./modules/helper');

// -------------------------------

// Initialize the Express server
const app = express();

app.use(function (req, res, next) {
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();    
});

// Passport Session config 
// -------------------------------
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false ,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000,
	sameSite: 'strict'
    }
}));
  
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    (username, password, done) => {
        const db_acc = new dbjson( __dirname + '/database/db_acc.json');
        let acc = db_acc.get(username);
        if (acc === undefined || acc.pwd != password){
            console.log('\x1b[31m%s\x1b[0m', 'Failed to authorize : ' + username);
            return done(null, false);
        } 
        else{
            console.log('\x1b[32m%s\x1b[0m', 'Authorized : ' + username);
            let authenticated_user = {
                id: username,
                role: acc.role,
            };
            return done(null, authenticated_user);
        }  
    }
));
  
passport.serializeUser( (userObj, done) => {
    done(null, userObj);
});

passport.deserializeUser((userObj, done) => {
    done (null, userObj )
});

checkAuthenticated = (req, res, next) => {
    console.log("Authenticating for access to " + req.originalUrl + "...")
    if (req.isAuthenticated()) { 
        console.log("Authentication done for access to " + req.originalUrl);
        return next();
    }
    res.redirect("/login")
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
                return res.redirect('/');
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
  
  
// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mustache config
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/pages');

// Static files config
app.use(express.static(__dirname + '/static'));

// ****

app.get('/login', csrfProtection, async (req,res) => {
    res.render(path.resolve('./pages/login.html'), {
        "protocol": config.PROTOCOL,
        "frontendUrl": frontendUrl,
        "backendUrl": backendUrl,
        "csrfToken": req.csrfToken()
    });
});
  
app.post('/login', 
    csrfProtection,
    rateLimiterAuthenticator,
     async (req, res) => {
        res.redirect('/home');
});

app.post('/logout', csrfProtection, function(req, res){
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});


app.get('/home', csrfProtection, checkAuthenticated, async (req, res) => {
    const role = req.user.role;
    try {
        let states = await prmsRequest(config.PROTOCOL + "://" + backendUrl + "/api/states", "POST", {
            password: config.BACKEND_SECRET,
            role: role
        });
        res.render(path.resolve('./pages/home.html'), {
            "articles": states,
            "protocol": config.PROTOCOL,
            "frontendUrl": frontendUrl,
            "backendUrl": backendUrl,
            "csrfToken": req.csrfToken()
        });      
    } catch (error) {
        console.log(error);
        res.redirect('/error/502');
    }
});

app.get('/', checkAuthenticated,
  async(req,res)=>{
    res.redirect("/home");
});

app.get('/error/:code',
  async(req,res)=>{
    const code = req.params.code;
    const message = req.query.msg || "An error has occurred. Please report it to an administrator.";
    res.render(__dirname + '/pages/error.html', {
      "code": code,
      "msg": message
    });
});

app.get('*', function(req, res){
    res.redirect("/error/404?msg=Page not found.");
});

app.listen(config.FRONTEND_PORT, () => {
    console.log('\x1b[33m%s\x1b[0m', "Serveur running on : http://" + config.FRONTEND_HOST + ":" + config.FRONTEND_PORT);
});



