describe('PUT /users/:user/password', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return 403 when change other\'s password', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(fixtures.users[1].id).password.put();
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(403);
    }
  });

  it('should return 404 when not found', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(123456789).password.put();
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(404);
    }
  });

  it('should return 400 with wrong old password', function *() {
    var user = fixtures.users[0];
    try {
      yield api.$auth(user.email, user.password).users(user.id).password.put({
        newPassword: 'updated password',
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err.statusCode).to.eql(400);
      expect(err.body.error).to.eql('Wrong Password');
    }
  });

  it('should change the password successfully with correct old password', function *() {
    var user = fixtures.users[0];
    yield api.$auth(user.email, user.password).users(user.id).password.put({
      oldPassword: user.password,
      newPassword: 'new password'
    });
    yield user.reload();
    expect(yield user.comparePassword('new password')).to.eql(true);
  });
});
