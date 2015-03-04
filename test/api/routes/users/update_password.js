describe('PUT /users/:user/password', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.put('/users/me/password');
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when change other\'s password', function *() {
    var user = fixtures.users[0];
    try {
      yield route.put(`/users/${fixtures.users[1].id}/password`, null, {
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
      yield route.put('/users/123456789/password', null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return WrongPassword with wrong old password', function *() {
    var user = fixtures.users[0];
    try {
      yield route.put(`/users/${user.id}/password`, {
        newPassword: 'updated password',
      }, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.WrongPassword);
    }
  });

  it('should change the password successfully with correct old password', function *() {
    var user = fixtures.users[0];
    yield route.put(`/users/${user.id}/password`, {
      oldPassword: user.password,
      newPassword: 'new password'
    }, {
      auth: [user.email, user.password]
    });
    yield user.reload();
    expect(yield user.comparePassword('new password')).to.eql(true);
  });
});
