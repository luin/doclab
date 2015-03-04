describe('GET /users/:user', function() {
  beforeEach(function *() {
    yield fixtures.load('users');
    this.user = fixtures.users[0];
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.get(`/users/$(this.user.id)`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return info', function *() {
    var user = yield route.get(`/users/${this.user.id}`, {
      auth: [this.user.email, this.user.password]
    });
    expect(user).to.have.property('name', this.user.name);
    expect(user).to.have.property('isOwner', this.user.isOwner);
    expect(user).to.have.property('email', this.user.email);
    expect(user).to.not.have.property('password');
  });

  it('should be able to get others info', function *() {
    var user = yield route.get(`/users/${this.user.id}`, {
      auth: [fixtures.users[1].email, fixtures.users[1].password]
    });
    expect(user).to.have.property('name', this.user.name);
    expect(user).to.have.property('isOwner', this.user.isOwner);
    expect(user).to.have.property('email', this.user.email);
    expect(user).to.not.have.property('password');
  });

  describe('alias me', function() {
    it('should return info', function *() {
      var me = yield route.get('/users/me', {
        auth: [this.user.email, this.user.password]
      });
      expect(me).to.have.property('name', this.user.name);
      expect(me).to.have.property('isOwner', this.user.isOwner);
      expect(me).to.have.property('email', this.user.email);
      expect(me).to.not.have.property('password');
    });
  });
});
