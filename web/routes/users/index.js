var router = module.exports = new (require('koa-router'))();
var config = require('config');

router.patch('/me', function *() {
  yield this.api.users('me').patch(this.request.body);
  this.flash = { msgs: 'Updated successfully' };
  this.redirect(this.query.next || '/settings/profile');
});

router.post('/me/avatar', function *() {
  if (!this.request.is('multipart/*')) {
    return yield next;
  }

  var parts = parse(this, {
    autoFields: true,
    limits: {
      fileSize: 2 * 1024 * 1024
    }
  });
  var tempFile = path.join(os.tmpdir(), randomFileName());
  var part = yield parts;
  while (part) {
    part.pipe(fs.createWriteStream(tempFile));
    part = yield parts;
  }

  var bigAvatarPath = path.join(os.tmpdir(), randomFileName());
  var bigAvatar = gm(tempFile).setFormat('jpg').quality(90).resize(512, 512, '^').gravity('Center').extent(256, 256);
  yield bluebird.promisify(bigAvatar.write, bigAvatar)(bigAvatarPath);

  var avatarPath = path.join(os.tmpdir(), randomFileName());
  var avatar = gm(bigAvatarPath).quality(90).resize(64, 64);
  yield bluebird.promisify(avatar.write, avatar)(avatarPath);

  yield this.api.users('me').avatar.put({
    big: 'file://' + bigAvatarPath,
    narmal: 'file://' + avatarPath
  });

  this.flash = { msgs: 'Avatar has been changed successfully' };
  this.redirect('/settings/profile');
});
