// ----------- IMPORTS -----------

// Imports for JSON database management (authentication only)
const dbjson = require('simple-json-db');
const db = new dbjson( __dirname + '/database/db.json');
const db_acc = new dbjson( __dirname + '/database/db_acc.json');
// Imports for Web Server management
const express = require('express');

// Import for Mustache management
const mustacheExpress = require('mustache-express');
const request = require('request');

const axios = require('axios');
const open = require('open');
const bodyParser = require('body-parser');

// Import dotvenv file
require('dotenv').config();
const config = process.env

// import passport
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy


// Other Imports
const fs = require('fs')
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
    secret: "secret",
    resave: false ,
    saveUninitialized: true 
  }));
  
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(
    (username, password, done) => {
        console.log(username);
        let acc = db_acc.get(username);
        console.log(acc);
        if (acc === undefined || acc.pwd != password){
            console.log('failed auth')
            return done(null, false);
        } 
        else{
            console.log('auth ok')
            let authenticated_user = { "id": username};
            return done(null, authenticated_user);
        }  
    }
  ));
  
  passport.serializeUser( (userObj, done) => {
    console.log("serialize");
    done(null, userObj);
  });
  
  passport.deserializeUser((userObj, done) => {
    console.log("deserealize");
    done (null, userObj )
  });
  
  checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) { console.log("auth done"); return next() }
    console.log("redirect");
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

app.get('/api/:pp', async (req, res) => {
    res.sendFile(__dirname + '/pp/' + req.params.pp);
});



app.get('/login', async (req,res) => {
    res.sendFile(path.resolve('./pages/login.html'));
  })
  
app.post('/login',
passport.authenticate('local', { failureRedirect: '/login', failureMessage: true }),
async (req, res) => {
    res.redirect('/home' + req.user.id);
});


app.get('/home', checkAuthenticated, async (req, res) => {
    let allInfo = [];
    try {
        
        const states = JSON.parse(await prmsRequest("http://" + config.NODE_RED_EXPRESS_HOST + ":" + config.NODE_RED_EXPRESS_PORT + "/api/states"));
        await Promise.all(Object.keys(states).map(async function(e) {
            const currentState = JSON.parse(await prmsRequest("http://" + config.NODE_RED_EXPRESS_HOST + ":" + config.NODE_RED_EXPRESS_PORT + "/api/current-state/" + e)).currentState;
            const person = states[e];

            let info = {
                pp: "",
                firstNameRaw: person.firstName,
                firstName: "",
                lastName: person.lastName,
                building: person.building,
                department: person.department,
                office: person.office,
                statusColor: "",
                statusMsg: "",
            };

            // Find if the person is in the database
            if (fs.existsSync(path.resolve("./static/pp/" + e + ".jpg"))) {
                info.pp = e;
            } else {
                info.pp = "undefined";
            }

            // Reduce first name
            if(person.firstName.includes(" ")){
                fn = person.firstName.split(' ')
                fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
                info.firstName = fn.slice(1);
            } else {
                info.firstName = person.firstName;
            }

            // Find if the current state is defined
            if(currentState !== "undefined"){
                info.statusColor = person.states[currentState].color;
                info.statusMsg = person.states[currentState].msg;
            }
            else{
                info.statusColor = "grey";
                info.statusMsg = "undefined";
            }

            allInfo.push(info);
        }));
        res.render(__dirname + '/pages/home.html', {"articles":allInfo});
           
    } catch (error) {
        console.log(error);
        res.redirect('/error/502');
    }
    
   
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

app.listen(config.PORT, () => {
    console.log('\x1b[33m%s\x1b[0m', "Serveur running on : http://" + config.HOST + ":" + config.PORT);
});



