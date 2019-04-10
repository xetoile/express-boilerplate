# Georges test

## test file template

```js
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
// ...

describe('some suite', async () => {
  before(async () => {
    // boot up and wait for it
    globals.server = await require('./server')(); // or ../server
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
  // tests here
  // ...
});
```

### disclaimer

- tests leak globals: `The following leaks were detected:__core-js_shared__`, due to the tests themselves (apparently supertest deps)