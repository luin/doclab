describe('GET /projects', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.user = fixtures.users[1];
    yield this.user.addTeams([
      fixtures.teams[1],
      fixtures.teams[2],
      fixtures.teams[3]
    ]);
    yield fixtures.teams[1].addProjects([
      fixtures.projects[0],
      fixtures.projects[1]
    ], { permission: 'read' });
    yield fixtures.teams[2].addProjects([
      fixtures.projects[1],
      fixtures.projects[2]
    ], { permission: 'write' });
    yield fixtures.teams[3].addProjects([
      fixtures.projects[1],
      fixtures.projects[3]
    ], { permission: 'admin' });
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.get('/projects');
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return all projects when user is owner', function *() {
    var owner = fixtures.users[0];
    var projects = yield route.get('/projects', {
      auth: [owner.email, owner.password]
    });

    expect(projects).to.have.length(fixtures.projects.length);
    projects.forEach(function(project) {
      expect(project).to.have.property('permission', 'admin');
    });
  });

  it('should return all my projects with correct permission', function *() {
    var user = this.user;
    var projects = yield route.get('/projects', {
      auth: [user.email, user.password]
    });
    expect(projects).to.have.length(4);
    projects.forEach(function(project) {
      switch (project.id) {
      case fixtures.projects[0].id:
        expect(project).to.have.property('permission', 'read');
        break;
      case fixtures.projects[1].id:
        expect(project).to.have.property('permission', 'admin');
        break;
      case fixtures.projects[2].id:
        expect(project).to.have.property('permission', 'write');
        break;
      case fixtures.projects[3].id:
        expect(project).to.have.property('permission', 'admin');
        break;
      }
    });
  });

  describe('?permission=:permission', function() {
    it('should filter permission', function *() {
      var user = this.user;
      var projects = yield route.get('/projects', {
        params: { permission: 'write' },
        auth: [user.email, user.password]
      });
      expect(projects).to.have.length(1);
      expect(projects[0].id).to.eql(fixtures.projects[2].id);
    });
  });

  describe('?sort=+fieldName(id, createdAt, updatedAt)', function() {
    ['asc', 'desc'].forEach(function(order) {
      it('should support sort id ' + order, function *() {
        var user = this.user;
        var projects = yield route.get('/projects', {
          params: { sort: (order === 'asc' ? '+' : '-') + 'id' },
          auth: [user.email, user.password]
        });
        for (var i = 1; i < projects.length; ++i) {
          expect(projects[i].id).to.be[order === 'asc' ? 'gte' : 'lte'](projects[i - 1].id);
        }
      });
    });
  });
});
