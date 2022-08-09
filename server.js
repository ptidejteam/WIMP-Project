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

// passport implementation 
app.use(session({
    secret: config.SESSION_SECRET,
    resave: false ,
    saveUninitialized: true,
    cookie: {
        maxAge: 3600000
    }
}));
  
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    (username, password, done) => {
        const db_acc = new dbjson( __dirname + '/database/db_acc.json');
        let acc = db_acc.get(username);
        if (acc === undefined || acc.pwd != password){
            console.log('Failed to authorize : ' + username);
            return done(null, false);
        } 
        else{
            console.log('Authorized : ' + username);
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

app.get('/login', async (req,res) => {
    res.render(path.resolve('./pages/login.html'), {
        "protocol": config.PROTOCOL,
        "frontendUrl": frontendUrl,
        "backendUrl": backendUrl
    });
});
  
app.post('/login',
  passport.authenticate('local', { failureMessage: "true" }),
  async (req, res) => {
      res.redirect('/home');
});

app.post('/logout', function(req, res){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/login');
    });
});


app.get('/home', checkAuthenticated, async (req, res) => {
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



