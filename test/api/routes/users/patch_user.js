describe('PATCH /users/:user', function() {
  beforeEach(function *() {
    yield fixtures.load();
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.patch('/users/me');
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when patch other people', function *() {
    var user = fixtures.users[0];
    try {
      yield route.patch(`/users/${fixtures.users[1].id}`, null, {
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
      yield route.patch('/users/123456789', null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should allow empty body', function *() {
    var user = fixtures.users[0];
    var result = yield route.patch(`/users/${user.id}`, null, {
      auth: [user.email, user.password]
    });
    expect(result.changedProperties).to.eql([]);
  });

  it('should update the specific properties', function *() {
    var user = fixtures.users[0];
    var result = yield route.patch(`/users/${user.id}`, {
      name: 'updated name'
    }, {
      auth: [user.email, user.password]
    });
    expect(result.changedProperties).to.eql(['name']);
    expect(yield user.reload()).to.have.property('name', 'updated name');
  });

  it('should support alias "me"', function *() {
    var user = fixtures.users[0];
    yield route.patch('/users/me', {
      name: 'updated name'
    }, {
      auth: [user.email, user.password]
    });
    expect(yield user.reload()).to.have.property('name', 'updated name');
  });
});
