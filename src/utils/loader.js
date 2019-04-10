const fs = require('fs');
const Path = require('path');

/*
load all .js in a directory (NOT recursive)
throws/rejects if err on file system
- path: path to the directory
- pattern: loads only if file pattern matches, defaults to .js files except test files
- options: if the required deps need to be called, pass something here that serves as argument
returns an object where keys are base file name (without extension)
*/
module.exports = function ({path, pattern, options}) {
  if (!pattern) {
    pattern = /(?<!-test)\.js$/;
  }
  return new Promise((resolve, reject) => {
    if (!Path.isAbsolute(path)) {
      reject(new Error(`Provided path "${path}" must be absolute.`));
    }
    fs.readdir(path, {withFileTypes: true}, (err, files) => {
      if (err) {
        return reject(err);
      }
      return resolve(
        files
        .filter(f => {
          return f.isFile() && f.name.match(pattern);
        })
        .sort((a, b) => {
          return a.name > b.name;
        })
        .reduce((out, f) => {
          const required = require(Path.join(path, f.name));
          const baseName = f.name.substr(0, f.name.length - 3);
          return out[baseName] = options ? required(options) : required;
        }, {})
      );
    });
  });
};