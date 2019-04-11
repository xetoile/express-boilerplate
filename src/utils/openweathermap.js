const https = require('https');
const config = require('config').get('openweathermap');

module.exports = {
  current: async function (city) {
    return new Promise((resolve, reject) => {
      console.log(`https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${config.key}`);
      const req = https.request(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${config.key}`,
        {
          headers: {
            accept: 'application/json'
          }
        },
        (res) => {
          if (res.statusCode !== 200) {
            return reject("Weather service unavailable, retry later.");
          }
          res.on('data', (buffer) => {
            const data = JSON.parse(buffer.toString());
            resolve(data);
          });
        }
      );
      req.on('error', (e) => {
        reject(e);
      });
      req.end();
    });
    
    // temp = temp - 273
  }
};