var express = require("express");
const prmsRequest = require('./helper');
var path = require('path');
const fs = require('fs')
const filterRouter = require("./filterRouter");

// DB config
const JSONdb = require('simple-json-db');

// Import dotvenv file
require('dotenv').config();
const config = process.env;

// Ipfilter config
const ipfilter = require('express-ipfilter').IpFilter;
const ipfilterConfig = {
    mode: "allow",
    logLevel: "deny"
};
const authorizedIPs = [config.AUTHORIZED_IP];


const apiRouter = express.Router();

apiRouter.use("/filter", filterRouter)

apiRouter.get('/pp/:pp', async(req,res)=>{
    const contents = fs.readFileSync(path.resolve("./pp/" + req.params.pp + ".jpg"), {encoding: 'base64'});
    res.send(contents).status(200);
    // res.sendFile("/pp/" + req.params.pp + ".jpg", {'root': __dirname + "/.."});
});

apiRouter.get('/states', ipfilter(authorizedIPs, ipfilterConfig), async(req,res)=>{
    const db_staff = new JSONdb('./database/staff.json');
    let staff = {};
    let states = [];
    try{
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

            console.log(state.pp);  

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
                state.statusMsg = "Disconnected";
            } else {
                // Find if the current state is defined
                const db_data = new JSONdb(path.resolve('./database/db.json'));
                let currentState = "undefined";
                if (db_data.has(e)){
                    currentState = db_data.get(e);
                }
                state.currentState = currentState;
                
                // Find the color & msg of the state
                if(currentState !== "undefined"){
                    state.visibility = person.states[currentState].visibility;
                    state.statusColor = person.states[currentState].color;
                    state.statusMsg = person.states[currentState].msg;
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
                    state.statusMsg = "undefined";
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