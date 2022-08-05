var express = require("express");

// Database import
const JSONdb = require('simple-json-db');

// Import dotvenv file
require('dotenv').config();
const config = process.env;

let backendUrl = "";
if (config.ENV === "dev") {
    backendUrl = config.PROTOCOL + "://" + config.BACKEND_HOST + ":" + config.BACKEND_PORT;
} else if (config.ENV === "prod") {
    backendUrl = config.PROTOCOL + "://" + config.BACKEND_HOST;
}

// Import custom modules
const prmsRequest = require('./helper');

// Other imports
var path = require('path');
const fs = require('fs')
const bcrypt = require('bcrypt');

// Import subrouters
const filterRouter = require("./filterRouter");

// API Authorization middleware
checkApiAuthorization = (req, res, next) => {
    bcrypt.compare(req.body.password, config.BACKEND_SECRET, function(err, result) {
        if (result === true) {
            console.log('\x1b[32m%s\x1b[0m', "API Authorization successful for " + req.originalUrl);
            next();
        } else {
            console.log('\x1b[31m%s\x1b[0m', "API Authorization failed for " + req.originalUrl);
            res.status(401).send("Unauthorized");
        }
    });
}

// Router definition
const apiRouter = express.Router();

apiRouter.use("/filter", filterRouter)

apiRouter.get('/pp/:pp', async(req,res)=>{
    const contents = fs.readFileSync(path.resolve("./pp/" + req.params.pp + ".jpg"), {encoding: 'base64'});
    res.send(contents).status(200);
});

apiRouter.post('/states', checkApiAuthorization, async(req,res)=>{
    const db_staff = new JSONdb('./database/staff.json');
    
    let staff = {};
    let states = [];
    try{
        const currentStates = await prmsRequest(backendUrl + "/node/currentStates", "POST", {password: config.NODE_RED_SECRET});

        staff = db_staff.JSON();
        Object.keys(staff).forEach(e => {
            const person = staff[e];
            let state = {
                id: e,
                pp: "",
                firstNameRaw: person.firstName,
                firstName: "",
                lastName: person.lastName,
                building: person.building,
                department: person.department,
                office: person.office,
                statusColor: "",
                statusMsg: "",
                defaultMsg: "",
                currentState: "",
                visibility: {}
            }

            // Find if the person is in the database
            if (fs.existsSync(path.resolve('./pp/' + person.pp))) {
                state.pp = e;
            } else {
                state.pp = "undefined";
            }

            // Reduce first name
            if(person.firstName.includes(" ")){
                fn = person.firstName.split(' ')
                fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
                state.firstName = fn.slice(1);
            } else {
                state.firstName = person.firstName;
            }

            if (person.tracking === "OFF") {
                state.statusColor = "grey";
                state.defaultMsg = "Disconnected";
            } else {
                // Find if the current state is defined
                let currentState = Object.keys(currentStates).find(status => status === e);
                state.currentState = currentStates[currentState];
             
                // Find the color & msg of the state
                if ((state.currentState !== undefined) && (state.currentState !== "")){
                    state.visibility = person.states[state.currentState].visibility;
                    state.statusColor = person.states[state.currentState].color;
                    state.statusMsg = person.states[state.currentState].msg;
                    switch (state.statusColor) {
                        case "green":
                            state.defaultMsg = person.default.available;
                            break;
                        case "orange":
                            state.defaultMsg = person.default.busy;
                            break;
                        case "red":
                            state.defaultMsg = person.default.unavailable;
                            break;
                    }
                }
                else {
                    state.statusColor = "grey";
                    state.defaultMsg = "undefined";
                }
            }
            states.push(state);
        })
    }
    catch (e){
        console.log(e);   
    }
    res.send(states).status(200);
});

module.exports = apiRouter;
