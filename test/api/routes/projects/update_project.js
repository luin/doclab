describe('PATCH /projects/:projectId', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.admin = fixtures.users[1];
    this.writer = fixtures.users[2];
    yield this.admin.addTeam(fixtures.teams[0]);
    yield this.writer.addTeam(fixtures.teams[1]);
    this.project = fixtures.projects[0];
    yield fixtures.teams[0].addProject(this.project, { permission: 'admin' });
    yield fixtures.teams[1].addProject(this.project, { permission: 'write' });
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.patch(`/projects/${fixtures.projects[0].id}`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when project is not found', function *() {
    var user = fixtures.users[0];
    try {
      yield route.patch('/projects/1993', null, {
        auth: [user.email, user.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have admin permission', function *() {
    try {
      yield route.patch(`/projects/${this.project.id}`, null, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should update project and leave `updatedAt` untouched', function *() {
    var result = yield route.patch(`/projects/${this.project.id}`, {
      name: 'new name'
    }, {
      auth: [this.admin.email, this.admin.password]
    });
    yield this.project.reload();
    expect(this.project).to.have.property('name', 'new name');
  });
});
