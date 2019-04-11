const PromocodeValidator = require('../utils/promocode');

module.exports = function ({app, config}) {
  app.get('/', (req, res) => {
    res.render('index');
  });
  // TODO set /admin/* routes in their own router
  // promocode form to insert
  app.get('/admin/promocode', (req, res) => {
    res.render('admin.promocode');
  });
  // promocode insert
  app.post('/admin/promocode', (req, res) => {
    const body = req.body;
    app.rdb.run((db) => {
      return db.table('promocodes').insert(body);
    }).then(() => {
      res.send({status: 'accepted'});
    }).catch((err) => {
      res.send({
        status: 'denied',
        reason: `${err}`
      });
    });
  });
  app.get('/promocode', async (req, res) => {
    res.render('promocode');
  });
  // request a promocode
  app.post('/promocode', async (req, res) => {
    const promocodeValidator = new PromocodeValidator();
    const body = req.body;
    console.log(body)
    const codes = await app.rdb.run((db) => {
      return db.table('promocodes').getAll(body.name, {index: 'name'})
    })
    // have we found something?
    if (!codes || !codes.length) {
      return res.send({
        status: 'denied',
        reasons: ['no code with such a name']
      })
    }
    const code = codes[0];
    const verdict = await promocodeValidator.validate(body.arguments, code.restrictions);
    if (verdict) {
      res.send({
        name: code.name,
        status: 'accepted',
        avantage: code.avantage

      });
    } else {
      res.send({
        name: code.name,
        status: 'denied',
        reasons: promocodeValidator.reasons
      });
    }
  });
};