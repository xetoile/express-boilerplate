module.exports = function ({app, config}) {
  app.get('/', (req, res) => {
    res.render('index');
  });
};