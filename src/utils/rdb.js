const r = require('rethinkdb');
const baseTables = [
  'promocodes'
];
module.exports = async function ({app, config}) {
  r.connect(config, (err, conn) => {
    if (err) {
      return reject(err);
    }
    app.rdb = {
      r,
      conn,
      run: function (queryFn) {
        return new Promise((resolve, reject) => {
          queryFn(this.r.db(config.db)).run(this.conn, (err, cursor) => {
            if (err) {
              return reject(err);
            }
            if (cursor.toArray) {
              return resolve(cursor.toArray());
            }
            return resolve(cursor);
          });
        })
      }
    }
    return app.rdb.run((db) => {
      return app.rdb.r.dbList().contains(config.db).do((containsDb) => {
        return r.branch(
          containsDb,
          {created: 0},
          r.dbCreate(config.db)
        );
      });
    // chain .then for table creations here
    }).then(() => {
      return Promise.all(baseTables.map((tableName) => {
        return app.rdb.run((db) => {
          return app.rdb.r.db(config.db).tableList().contains(tableName).do((containsTable) => {
            return r.branch(
              containsTable,
              {created: 0},
              r.db(config.db).tableCreate(tableName)
            );
          });
        });
      }));
    // chain indexes
    }).then(() => {
      return app.rdb.run((db) => {
        return db.table('promocodes').indexList().contains('name').do((containsName) => {
          return r.branch(
            containsName,
            {created: 0},
            r.db(config.db).table('promocodes').indexCreate('name')
          );
        });
      })
    });
  });
};