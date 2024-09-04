---
sidebar_position: 3
---

# Back-Backend

The back-backend which contains the Node-Red part and the API accesible through the backend or the front of the system.

Each time a student wants to access the status of his teachers, the frontend server sends a request to the express api.
Express. Express will check this request and then interogate Node-RED with a GET in order to notify the different states of the professor. Finally Express will transform the raw information received by Node-RED (as 'int', for example) and return clean information (as 'not available').


## Node-RED
Node-RED is embedded in the Express server. That is to say that it plays the role of an API. However Node-RED will be launched as a classical server except that all requests will go through the Express server.
The Express server will make requests to `/node` to acces the Node-RED server.

```javascript
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

RED.init(server, settings);
app.use(settings.httpNodeRoot, nodeRedAccess, RED.httpNode);
app.use(settings.httpAdminRoot, checkAuthenticated, nodeRedAuthentication, RED.httpAdmin);
...

RED.start();
```

This configuration allows to access the Node-RED web interface through the `/red` and access the Node-RED API through the `/node`.


To learn more about Node-RED, please see this [page](node-red.md).

### Security of the Node-RED web interface

In order to secure the access to the Node-RED web interface, we decided to use a succession of two middlewares. The first middleware `checkAuthenticated` allows to check if the user that wants to access the interface is authenticated and have a valid session on the server side. The second middleware `nodeRedAuthentication` while update the request with the "credentials" to access to the web interface as an anonymous user.

```js 
nodeRedAuthentication = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.user = {
            "anonymous":true,
            "permissions": "*"
        }
    }
    return next();
}
```

### Security of the Node-RED API

In order to secure the access to the Node-RED API, we decided to develop a custom middleware. Indeed, we needed a middleware that can adapt depending on the endpoint that is requested because we need to distinguish two types of request to the Node-RED API:
- The requests that come from the backend Express server himself
- The requests that come from external IoT devices which want to send data

Here is the code of the middleware that we developed:

```js
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
```
Thanks to this custom middleware, we can create security exceptions for the external IoT devices that want to send their data while authorizating only the requests that come from the backend himself. All the others request are rejected and redirected to the login page. 

:::note
For the requests that come from the backend himself and that have a target which is Node-RED API endpoint, they must be of POST type and have a body of this type:
`{
    "password": "**Node-RED API Secret**"
}` 
:::


## Receive request

All the API routes are in the `/modules/apiRouter.js`

The frontend webserver call a POST on /states to get the states while providing the right password to get an access to the backend API and make sure that the request comes from an authorized web server.

The program will browse the entire database where the teachers are stored.
It will create a profile for each teacher containing the information that will be sent as a response. 
```js
...
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
    ...
```

Finally, the program will fill in the relevant fields through a series of processes and then store the profile in a list that will be sent as a response.
The most important part is when the server calls Node-RED to get the teacher's availability status. To do this the server makes an http request to Node-RED (which is actually implemented as an internet API to the server).
```js
try {
    ...
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
        // check if the professor is on mode "tracking off"
        if (person.tracking === "OFF") {
            state.statusColor = "grey";
            state.statusMsg = "Disconnected";
        } else {

            // Find if the current state is defined <----
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
catch (e) {
    console.log(e);   
}
res.send(states).status(200);
```

