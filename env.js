GLOBAL._ = require('lodash');
var config = require('config');

var axios = require('axios');
axios.interceptors.request.use(function (req) {
  req.url = `http://127.0.0.1:${config.site.port}/api${req.url}`;
  if (req.auth) {
    req.headers.Authorization = 'Basic ' + new Buffer(req.auth.join(':')).toString('base64');
  }
  return req;
});

axios.interceptors.response.use(function (res) {
  return res.data;
}, function (err) {
  err.body = err.data;
  return Promise.reject(err);
});

GLOBAL.route = axios;
