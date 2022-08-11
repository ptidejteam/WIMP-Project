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
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy

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
    done (null, userObj )
});


checkAuthenticated = (req, res, next) => {
    console.log("Authenticating for access to " + req.originalUrl + "...")
    if (req.isAuthenticated()) { 
        console.log("Authentication done for access to " + req.originalUrl);
        return next(); 
    }
    res.redirect("/login");
}

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
app.get('/login', async (req,res) => {
    res.render(path.resolve('./pages/login.html'), {
        "protocol": config.PROTOCOL,
        "frontendUrl": frontendUrl,
        "backendUrl": backendUrl
    });
})

app.post('/login',
    passport.authenticate('local', { failureMessage: "true" }),
    async (req, res) => {
        res.redirect('/profile/' + req.user.id);
    }
);

app.post('/logout', function(req, res){
    req.logout(function(err) {
    if (err) { return next(err); }
        res.redirect('/login');
    });
});

app.get('/myflow', checkAuthenticated, async(req,res)=>{
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

app.get('/profile/:id', checkAuthenticated,
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
            "frontendUrl": frontendUrl
        }); 
    }
);

app.post('/update-states', checkAuthenticated, function(req, res) {
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
        res.send("OK").status(200);
    }
    return res;
});


app.post('/tracker/update', checkAuthenticated, function(req, res) {
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
