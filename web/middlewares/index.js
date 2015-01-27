var inflection = require('inflection');
var middlewares = require('node-require-directory')(__dirname);

Object.keys(middlewares).forEach(function(key) {
  exports[inflection.camelize(key, true)] = middlewares[key];
});
