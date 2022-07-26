
const express = require('express');
const mustacheExpress = require('mustache-express');
const dbjson = require('simple-json-db');
const request = require('request');
require('dotenv').config();
const axios = require('axios');
const open = require('open');
const bodyParser = require('body-parser');


const app = express();
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/pages');
const config = process.env
const port = config.PORT;

const db = new dbjson( __dirname + '/db.json');


// ** use **


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


app.use(express.static(__dirname + '/static'));
// ****

function prmsRequest(url){
    return new Promise(function (resolve, reject) {
        request(url, function (error, res, body) {
            console.log(error)
          if (res.statusCode == 200) {
            resolve(body);
          } else {
            console.log('wrongStatus :' + res.statusCode )
            reject(error);
          }
        });
    })
}

app.get('/api/:pp', async (req, res) => {
    res.sendFile(__dirname + '/pp/' + req.params.pp);
})


app.get('/profile/:id', async (req, res) => {
    var arrayDB = await db.get(req.params.id);
    Object.keys(arrayDB.states).forEach(key => {
        arrayDB.states[key].id = key;
    });

    // console.log(arrayDB);
    // console.log(arrayDB.firstName + " " +arrayDB.lastName);
    // console.log(Object.values(arrayDB.states))
    res.render(__dirname + '/pages/profil.html', {
        "pp" : arrayDB.pp, 
        "name" : arrayDB.firstName + " " + arrayDB.lastName,
        "states":Object.values(arrayDB.states),
        "id":req.params.id
    });    
})



app.get('/', async (req, res) => {
    // -get the json
    let all_states = await prmsRequest("http://localhost:8000/states");
    all_states = JSON.parse(all_states);
    console.log(all_states)
    let arrayDB = Object.values(db.JSON());
    console.log(arrayDB);
    arrayDB.forEach(e => {
        
        //reduce first name
        if(e.firstName.includes(" ")){
            fn = e.firstName.split(' ')
            fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
            e.firstName = fn.slice(1);
        }
        
        if(all_states[e.id]){
            state = all_states[e.id];
            console.log(state)
            e.st_msg = e.states[state].msg;
            e.st_color = e.states[state].color;
        }
        else{
            e.status = "undefined";
            e.state = "";
        }
    });
    console.log(arrayDB);
    res.render(__dirname + '/pages/home.html', {"articles":arrayDB});
});

app.get('/red', async (req, res) => {
    const params = new URLSearchParams();
    params.append('id', 'Get Fitbit Profile');
    console.log(params.toString())
    console.log("http://" + config.NODE_RED_EXPRESS + "/myflow?" + params.toString())
    axios
      .get("http://" + config.NODE_RED_EXPRESS + "/myflow?" + params.toString())
      .then(function (response) {
          open("http://" + config.NODE_RED_EXPRESS + "/red/#flow/" + response.data.id, function (err) {
            if ( err ) throw err;    
          });
      })
      .catch(function (error) {
            console.log(error);
            res.send("An error has occurred").status(500);
      });
    res.send("OK").status(200);
    return res;
});


app.post('/update-states', async (req, res) => {
    const id = req.body.id;
    const states = req.body.states;
    if (!db.has(id)) {
        res.send("No user found").status(404);
    }
    else {
        const user = db.get(id);
        user.states = states;
        db.set(id, user);
        res.send("OK").status(200);
    }
    return res;
});





app.listen(port, () => {
    console.log("Serveur running");
    console.log("http://localhost:" + port.toString());
});



