const app = require("./app")
require('dotenv').config()
const PORT = process.env.PORT;


// listening
app.listen(PORT ,()=> {
    console.log("Device service running on port :" + PORT);
})


app.on('error',(error) => {
    if (error) {
        console.error(error);
        return process.exit(1)
    } else {
        console.log('express main configured  and listening on port:.')
    }
});