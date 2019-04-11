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

## disclaimer

- tests leak globals: `The following leaks were detected:__core-js_shared__`, due to the tests themselves (apparently supertest deps)
- no time for more tests
- admin section still empty

## requirements

- RethinkDB

## how to

- add a file `config/development.json` with data:

```
{
  "openweathermap": {
    "key": "APPID key goes there"
  }
}
```

- launch RethinkDB: `rethinkdb --http-port 8887`
- launch server (it'll create DB/table): `node .`
- navigate to RDB admin page: `http://localhost:8887`
- insert data using data explorer, e.g.:

```
r.db('expressBoilerplate').table('promocodes').insert({
  name: 'WeatherCode',
  avantage: { percent: 20 },
  restrictions: {
    "@or": [{
      "@age": {
    eq: 40
}
    }, {
      "@age": {
        lt: 30,
        gt: 15
      },
    }],
    "@date": {
      after: '2017-05-02',
  before: '2020-05-02',
    },
    "@meteo": {
      is: 'clear',
      temp: {
        gt: '15',
      }
    }
  }
})
```

- navigate to `http://localhost:3000/promocode` and try it