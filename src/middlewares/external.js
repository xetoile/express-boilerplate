// npm-installed only, loaded first
const bodyParser = require('body-parser');
module.exports = function ({app, config}) {
  // TODO maybe have bodyParser on a per-route basis?
  app.use(bodyParser.urlencoded(config.get('body-parser').urlencoded));
  app.use(bodyParser.json(config.get('body-parser').json));
  return {};
};