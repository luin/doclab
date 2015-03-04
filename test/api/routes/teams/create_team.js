describe('POST /teams', function() {
  beforeEach(function *() {
    yield fixtures.load();
    yield fixtures.users[0].addTeams(fixtures.teams[0]);
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.post('/teams');
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission if is not owner', function *() {
    var user = fixtures.users[1];
    try {
      yield route.post('/teams', null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter without the "name" parameter', function *() {
    var user = fixtures.users[0];
    try {
      yield route.post('/teams', {}, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create a user team correctly', function *() {
    var user = fixtures.users[0];
    var team = yield route.post('/teams', {
      name: 'team name'
    }, {
      auth: [user.email, user.password]
    });
    expect(team).to.have.property('name', 'team name');
  });
});
