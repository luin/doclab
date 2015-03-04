var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');
var bluebird = require('bluebird');
var fs = bluebird.promisifyAll(require('fs'));
var os = require('os');
var gm = require('gm');
var path = require('path');
var config = require('config');
var _ = require('lodash');

router.post('/', function *() {
  var isFirstUser = (yield User.count()) === 0;

  var allowSignUp = isFirstUser || (yield Setting.get('enableSignUp', true));
  this.assert(allowSignUp, new HTTP_ERROR.NoPermission('Sign up is disabled'));

  var user = User.build(this.request.body);
  if (isFirstUser) {
    user.isOwner = true;
  }
  this.body = yield user.save();
});

router.param('user', function *(id, next) {
  this.assert(this.me, new HTTP_ERROR.Unauthorized());

  if (id === 'me') {
    this.user = this.me;
  } else {
    this.user = yield User.find(id);
  }
  this.assert(this.user, new HTTP_ERROR.NotFound('User', id));
  yield next;
});

router.get('/:user', function *() {
  this.body = this.user;
});

router.patch('/:user', function *() {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());

  var properties = ['name', 'email'];
  _.intersection(properties, Object.keys(this.request.body)).forEach(function(key) {
    this.user[key] = this.request.body[key];
  }, this);

  var changed = this.user.changed();
  if (changed) {
    yield this.user.save();
  }
  this.body = { changedProperties: changed || [] };
});

router.put('/:user/password', function *() {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());

  var isPasswordCorrect = yield this.me.comparePassword(this.request.body.oldPassword);
  this.assert(isPasswordCorrect, new HTTP_ERROR.WrongPassword());

  this.body = yield this.me.updatePassword(this.request.body.newPassword);
});

var randomFileName = function() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var chars = [];
  for (var i = 0; i < 20; ++i) {
    chars.push(possible[Math.floor(Math.random() * possible.length)]);
  }
  return chars.join('');
};

router.post('/:user/avatar', function *(next) {
  this.assert(this.me.id === this.user.id, new HTTP_ERROR.NoPermission());
  yield next;
}, middlewares.multer(os.tmpdir(), config.upload.fileSizeLimit.avatar), function *() {
  var targetDir = path.join(__dirname, '..', '..', '..', config.upload.dir, 'avatars');
  var transformAvatar = function *(gmInstance, dest) {
    return yield bluebird.promisify(gmInstance.write, gmInstance)(dest);
  };

  var allowedExts = ['.jpg', '.gif', '.png'];
  this.assert(allowedExts.indexOf(path.extname(this.file.filename).toLowerCase()) !== -1, new HTTP_ERROR.WrongFileFormat(allowedExts));

  var baseFilename = randomFileName();

  var oldAvatarOrig = this.user.avatarOrig;
  this.user.avatarOrig = baseFilename + '.jpg';
  var avatarOrigPath = path.join(targetDir, this.user.avatarOrig);
  try {
    yield transformAvatar(
      gm(path.join(os.tmpdir(), this.filename)).setFormat('jpg').quality(90).resize(512, 512, '^').gravity('Center').extent(256, 256),
      avatarOrigPath
    );
  } catch (_) {
    this.throw(new HTTP_ERROR.WrongFileFormat());
  }
  if (oldAvatarOrig) {
    fs.unlink(path.join(targetDir, oldAvatarOrig), function() {});
  }

  if (this.user.avatar) {
    fs.unlink(path.join(targetDir, this.user.avatar), function() {});
  }
  this.user.avatar = baseFilename + '_64x64.jpg';
  var avatarPath = path.join(targetDir, this.user.avatar);
  yield transformAvatar(
    gm(avatarOrigPath).quality(90).resize(64, 64),
    avatarPath
  );

  var user = yield this.user.save();

  if (this.query.redirect) {
    this.redirect(this.query.redirect);
  } else {
    this.body = user;
  }
});
