if (!module.parent) {
  // use index.js or lab's test files
  throw new Error("None shall call this script directly.");
}

const http = require('http');
const express = require('express');
const Path = require('path');
// auto-loads cfg from ${ROOT}/config
const config = require('config');
// loader for directories
const loader = require('./utils/loader');
// rdb add-on
const rethinkdbLauncher = require('./utils/rdb');

// in here we don't care about time performance: it's only executed on server launch
module.exports = async function () {
  const app = express();
  // decorate app with rethinkdb
  await rethinkdbLauncher({app, config: config.get('rethinkdb')});
  // top-level configuration
  app.set('view engine', 'pug');
  app.set('views', Path.join(__dirname, 'views'));
  // mount general middlewares
  app.use('/public', express.static(Path.join(__dirname, 'public')));
  await loader({
    path: Path.join(__dirname, 'middlewares'),
    options: {app, config}
  });
  // mount endpoints and route-specific middlewares
  await loader({
    path: Path.join(__dirname, 'endpoints'),
    options: {app, config}
  });
  // run, Forrest, ruuun!
  const server = http.createServer(app);
  server.listen(config.get('port'), () => {
    console.log(`Ready for ${process.env.NODE_ENV} on :${config.port}`);
  });
  return server;
};