// ----------- IMPORTS -----------

// Imports for JSON database management (authentication only)
const dbjson = require('simple-json-db');
const db = new dbjson( __dirname + '/db.json');

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

// Other Imports

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

let getStates = function (req, res, next) {
    var options = {
        url: "http://" + config.NODE_RED_EXPRESS_HOST + ":" + config.NODE_RED_EXPRESS_PORT + "/api/states",
        timeout: 10
      } 

    request(options, function (error, statesRes, body) {
        if (error) {
            console.log(error); 
            res.redirect('/error/502');     
        } else 
        if (statesRes.statusCode == 200) {
            res.locals.states = body;
            next();
        } else {
            res.redirect('/error/' + statesRes.statusCode);
        }
    });
};

app.get('/home', getStates, async (req, res) => {
    const states = JSON.parse(res.locals.states);
    let allInfo = [];
    Object.values(states).forEach(e => {
        let info = {
            firstName: "",
            lastName: e.lastName,
            building: e.building,
            office: e.office,
            statusColor: "",
            statusMsg: ""
        };
        console.log(e);
        //reduce first name
        if(e.firstName.includes(" ")){
            fn = e.firstName.split(' ')
            fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
            info.firstName = fn.slice(1);
        }
        
        // if(all_states[e.id]){
        //     state = all_states[e.id];
        //     console.log(state)
        //     e.st_msg = e.states[state].msg;
        //     e.st_color = e.states[state].color;
        // }
        // else{
        //     e.status = "undefined";
        //     e.state = "";
        // }
    });
    console.log(arrayDB);
    res.render(__dirname + '/pages/home.html', {"articles":arrayDB});
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



