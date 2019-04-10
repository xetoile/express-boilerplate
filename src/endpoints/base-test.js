if (process.env.NODE_ENV !== 'test') {
  throw new Error("NODE_ENV not set to 'test'.");
}

// assertions
const expect = require('@hapi/code').expect;
// framework
const lab = require('@hapi/lab');
// lab CLI call needs this export
module.exports.lab = lab.script();
// shortcuts our framework tools
const {
  it, // test block
  describe, // suite block
  // suite-level controls around tests
  before,
  beforeEach,
  after,
  afterEach
} = module.exports.lab;
// stuff we want to keep track of across tests
const globals = {
  config: require('config')
};
// local deps
const request = require('supertest');

describe('base tests', () => {
  before(async () => {
    // boot up and wait for it
    globals.server = await require('../server')();
    // wait for server to be fully up and ready
    return new Promise(resolve => {
      globals.server.on('listening', resolve);
    });
  });
  after(() => {
    return new Promise(resolve => {
      globals.server.close(resolve)
    });
  });
  it('should fail on an absent endpoint', () => {
    expect(
      request(globals.server)
      .get('/thisispreposterous')
      .expect(200)
    ).to.reject();
  });
  it('should have a GET / endpoint with standard layout', () => {
    return request(globals.server)
    .get('/')
    .expect(200)
    .expect('Content-Type', /^text\/html/);
  });
});