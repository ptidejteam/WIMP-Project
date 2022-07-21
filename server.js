
const express = require('express');
const mustacheExpress = require('mustache-express');
const dbjson = require('simple-json-db');


const app = express();
app.engine('html', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/pages');
const port = 8000;



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

app.use(express.static(__dirname + '/static'));
// ****

const template = {
    "1" : "1"
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
    res.render(__dirname + '/pages/profil.html', {"pp" : arrayDB.pp, "name" : arrayDB.firstName + " " +arrayDB.lastName,"states":Object.values(arrayDB.states)})
    
    
})



app.get('/', async (req, res) => {
    // get the json
    
    arrayDB = Object.values(db.JSON());
    arrayDB.forEach(e => {
        
        //reduce first name
        if(e.firstName.includes(" ")){
            fn = e.firstName.split(' ')
            fn = fn.reduce((a,aa)=>{return (  a + "." + aa[0]) },"");
            e.firstName = fn.slice(1);
        }
        
        if(template[e.id]){
            state = template[e.id];
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
    res.render(__dirname + '/pages/home.html', {"articles":arrayDB})
});





app.listen(port, () => {
    console.log("Serveur running");
    console.log("http://localhost:" + port.toString());
});



