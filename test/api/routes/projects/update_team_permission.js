describe('PUT /projects/:projectId/teams/:teamId', function() {
  beforeEach(function *() {
    yield fixtures.load(['users', 'projects', 'teams']);
    this.project = fixtures.projects[0];
    this.team = fixtures.teams[0];
    this.owner = fixtures.users[0];
    this.user = fixtures.users[1];
    this.admin = fixtures.users[2];
    yield fixtures.teams[0].addUsers(fixtures.users[1]);
    yield fixtures.teams[1].addUsers(fixtures.users[2]);
    yield fixtures.projects[0].addTeams(fixtures.teams[0], { permission: 'write' });
    yield fixtures.projects[0].addTeams(fixtures.teams[1], { permission: 'admin' });
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`);
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission if user is not owner or admin', function *() {
    try {
      yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`, null, {
        auth: [this.user.email, this.user.password]
      });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return NotFound if team is not exists', function *() {
    try {
      yield route.put(`/projects/${this.project.id}/teams/123`, {
        permission: 'read'
      }, {
        auth: [this.admin.email, this.admin.password]
      });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should update permission successfully if user is owner', function *() {
    yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`, {
      permission: 'read'
    }, {
      auth: [this.owner.email, this.owner.password]
    });
  });

  it('should return InvalidParameter if permission is invalid', function *() {
    var url = `/projects/${this.project.id}/teams/${this.team.id}`;
    try {
      yield route.put(url, null, {
        auth: [this.admin.email, this.admin.password]
      });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
    try {
      yield route.put(url, {
        permission: 'invalid'
      }, {
        auth: [this.admin.email, this.admin.password]
      });
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should update permission successfully and return the previous permission', function *() {
    var result = yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`, {
      permission: 'read'
    }, {
      auth: [this.admin.email, this.admin.password]
    });
    expect(result.permissions.previous).to.eql('write');
    expect(result.permissions.current).to.eql('read');
  });

  it('should return null if team has no permission to the project', function *() {
    var result;
    result = yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`, {
      permission: null
    }, {
      auth: [this.admin.email, this.admin.password]
    });
    expect(result.permissions.current).to.eql(null);

    result = yield route.put(`/projects/${this.project.id}/teams/${this.team.id}`, {
      permission: 'read'
    }, {
      auth: [this.admin.email, this.admin.password]
    });
    expect(result.permissions.previous).to.eql(null);
  });
});
