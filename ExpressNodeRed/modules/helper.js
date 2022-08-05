const request = require('request');
const fs = require('fs');
const path = require('path');

require('dotenv').config();
const config = process.env;

async function prmsRequest(url, method = 'GET', body = null) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: url,
            timeout: 3000,
            method: method,
        }

	if (config.PROTOCOL === "https") {
	    options.ca = fs.readFileSync(path.resolve('./conf/backend-cacert.pem'));
	}

        if (method === 'POST') {
            options.json = body;
        }

        request(options, function (error, res, body) {
            if (error) {
                reject(error);     
            } else if (res.statusCode == 200) {
                resolve(body);
            } else {
                console.log('wrongStatus :' + res.statusCode )
                reject(res.statusCode);
            }
        });
    });
}

module.exports = prmsRequest;
