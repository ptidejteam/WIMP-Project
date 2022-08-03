const request = require('request');

async function prmsRequest(url, method = 'GET', body = null) {
    return new Promise(function (resolve, reject) {
        var options = {
            url: url,
            timeout: 3000,
            method: method,
        } 

        if (method === 'POST') {
            options.json = body;
        }

        console.log(options);

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
