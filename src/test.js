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
const Path = require('path');

describe('basic server tests', async () => {
  before(async () => {
    // boot up and wait for it
    globals.server = await require('./server')();
    // wait for server to be fully up and ready
    return new Promise(resolve => {
      globals.server.on('listening', resolve);
    });
  });
  after(() => {
    return new Promise(resolve => {
      globals.server.close(resolve);
    });
  });
  it('should be ready on configured port', () => {
    expect(globals.config.get('port')).to.be.a.number();
  });
});
describe('utilities tests', () => {
  describe('loader.js', () => {
    before(() => {
      globals.loader = require('./utils/loader');
    })
    it('should crash on relative path', () => {
      expect(globals.loader({path: './public'})).to.reject();
    })
    it('should have no hits in a dir with no .js', async () => {
      const result = await globals.loader({
        path: Path.join(__dirname, './public')
      });
      expect(Object.keys(result)).to.be.empty();
    });
    it('should have hits when .js are there', async () => {
      const result = await globals.loader({
        path: __dirname
      });
      expect(Object.keys(result)).to.be.not.empty();
    });
  });
});
