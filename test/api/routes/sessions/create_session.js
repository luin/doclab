describe('POST /sessions', function() {
  beforeEach(function *() {
    yield fixtures.load('users');
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield API.sessions.post({ ttl: 600 });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when user is authed with token', function *() {
    var user = fixtures.users[0];
    var session = yield Session.create({ ttl: 600, UserId: user.id, ip: '127.0.0.1' });
    try {
      yield API.$header('x-session-token', session.token).sessions.post({ ttl: 600 });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should create a session successfully', function *() {
    var user = fixtures.users[0];
    var session = yield API.$auth(user.email, user.password).sessions.post({ ttl: 600 });
    expect(session).to.have.property('token');
    expect(session.ttl).to.eql(600);
    expect(new Date(session.expiredAt) - new Date(session.createdAt)).to.eql(600 * 1000);
  });
});
