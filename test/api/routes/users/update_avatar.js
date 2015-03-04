var fs = require('bluebird').promisifyAll(require('fs'));
var path = require('path');
var config = require('config');

describe('POST /users/:user/avatar', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.post('/users/me/avatar');
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when change other\'s avatar', function *() {
    var user = fixtures.users[0];
    try {
      yield route.post(`/users/${fixtures.users[1].id}/avatar`, null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return NotFound when not found', function *() {
    var user = fixtures.users[0];
    try {
      yield route.post('/users/123456789/avatar', null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  describe.skip('handle avatar', function() {
    before(function() {
      this.avatarDir = path.join(__dirname, '..', '..', '..', '..', 'api', 'upload', 'avatars');
    });

    it('should change the avatar successfully', function *() {
      var user = fixtures.users[0];
      var result = yield API.$auth(user.email, user.password).users(user.id).avatar.post(null, null, {
        formData: {
          file: fs.createReadStream(
            path.join(__dirname, '..', '..', '..', 'helpers', 'assets', 'avatar.png')
          )
        }
      });
      var avatarOrig = result.avatarOrig.split('/').pop();
      var avatar = result.avatar.split('/').pop();
      expect(fs.existsSync(path.join(this.avatarDir, avatarOrig))).to.eql(true);
      expect(fs.existsSync(path.join(this.avatarDir, avatar))).to.eql(true);
      fs.unlinkSync(path.join(this.avatarDir, avatarOrig));
      fs.unlinkSync(path.join(this.avatarDir, avatar));
    });

    it('should remove old avatars', function *() {
      var user = fixtures.users[0];
      var res = [];
      for (var i = 0; i < 2; ++i) {
        res.push(yield API.$auth(user.email, user.password).users(user.id).avatar.post(null, null, {
          formData: {
            file: fs.createReadStream(
              path.join(__dirname, '..', '..', '..', 'helpers', 'assets', 'avatar.png')
            )
          }
        }));
      }
      expect(fs.existsSync(path.join(this.avatarDir, res[0].avatarOrig.split('/').pop()))).to.eql(false);
      expect(fs.existsSync(path.join(this.avatarDir, res[0].avatar.split('/').pop()))).to.eql(false);
    });
  });
});
