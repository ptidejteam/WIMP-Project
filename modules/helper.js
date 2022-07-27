const request = require('request');

function prmsRequest(url){
    return new Promise(function (resolve, reject) {
      var options = {
        url: url,
        timeout: 10
      } 

      request(options, function (error, res, body) {
        if (error) {
          reject(error);     
        } else 
        if (res.statusCode == 200) {
          resolve(body);
        } else {
          console.log('wrongStatus :' + res.statusCode )
          reject(error);
        }
      });
    })
}

module.exports = prmsRequest;