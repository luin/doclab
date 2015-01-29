var $ = require('jquery');

$.api = function(method, url, body, callback) {
  method = method.toUpperCase();

  var options = {
    type: method,
    url: url
  };

  if (method === 'GET') {
    options.data = body;
  } else {
    options.contentType = 'application/json';
    options.data = JSON.stringify(body);
  }

  $.ajax(options).done(function(res) {
    callback(null, res);
  }).fail(function(err) {
    callback(err.responseJSON || err.responseText);
  });
};

$.api.get = function(url, body, callback) {
  return $.api('GET', url, body, callback);
};

$.api.post = function(url, body, callback) {
  return $.api('POST', url, body, callback);
};

$.api.patch = function(url, body, callback) {
  body._method = 'PATCH';
  return $.api('POST', url, body, callback);
};

$.api.delete = function(url, body, callback) {
  body._method = 'DELETE';
  return $.api('POST', url, body, callback);
};

$.api.put = function(url, body, callback) {
  body._method = 'PUT';
  return $.api('POST', url, body, callback);
};
