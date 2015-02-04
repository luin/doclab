var WebSocketServer = require('ws').Server;
var cookie = require('cookie');

var config = require('config');
var ot = require('ot-server').createClient(config.redis);


module.exports = function(server) {
  var wss = new WebSocketServer({
    server: server,
    verifyClient: function(info, cb) {
      var sessionToken = cookie.parse(info.req.headers.cookie)['session-token'];
      if (typeof sessionToken === 'undefined') {
        return cb(false, 401);
      }
      var api = API;
      api.$header('user-agent', info.req.headers['user-agent']);
      api.$header('x-session-token', sessionToken);
      api.users('me').get().then(function(user) {
        info.req.user = user;
        info.req.api = api;
        cb(true);
      }).catch(function() {
        cb(false, 403);
      });
    }
  });

  wss.on('connection', function(ws) {
    var api = ws.upgradeReq.api;
    var user = ws.upgradeReq.user;

    ws.on('message', function(data) {
      try {
        data = JSON.parse(data);
      } catch(err) {
        return ws.close();
      }
      console.log(data);
    });
  });
};
