// this is the default entry point, except for test env
switch (process.env.NODE_ENV) {
  case 'development':
  case 'production':
    break;
  case 'test':
    throw new Error("Tests shall not call index.js, use test.js instead.");
  default:
    process.env.NODE_ENV = 'development';
}
require('./src/server')(); // async, but need not wait