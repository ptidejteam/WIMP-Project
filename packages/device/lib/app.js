const express = require("express") 

// Define the express object
const app = express();

const PORT = process.env.PORT || 3002;

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin',"*" );
    res.header('Access-Control-Allow-Methods', 'GET,GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Expose-Headers', 'Content-Length');
    res.header('Access-Control-Allow-Headers', 'Origin,Accept, Authorization, Content-Type, X-Requested-With, Range,X-Auth');
    if (req.method == 'OPTIONS') {
        res.sendStatus(200);
      }
      else {
        next();
      }
    });
app.use(bodyParser.json());

export default app;

