const app  = require("./app");
const PORT = process.env.PORT;

// listening
app.listen(PORT ,()=> {
    console.log("Gateway running on port :" + PORT);
})