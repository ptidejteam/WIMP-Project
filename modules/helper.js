const request = require('request');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const config = process.env;

async function prmsRequest(url){
    return new Promise(function (resolve, reject) {
        var options = {
            url: url,
            timeout: 3000,
        } 
	
	if (config.PROTOCOL === "https") {
            options.ca = fs.readFileSync(path.resolve('./conf/backend-cacert.pem'));
        } 

        request(options, function (error, res, body) {
            if (error) {
                reject(error);     
            } else if (res.statusCode == 200) {
                resolve(body);
            } else {
                console.log('wrongStatus :' + res.statusCode )
                reject(error);
            }
        });
    });
}

module.exports = prmsRequest;
