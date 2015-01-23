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
      yield API.projects(fixtures.projects[0].id).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NotFound when project is not found', function *() {
    var user = fixtures.users[0];
    try {
      yield API.$auth(user.email, user.password).projects(1993).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NotFound);
    }
  });

  it('should return NoPermission when the user don\'t have admin permission', function *() {
    try {
      yield API.$auth(this.writer.email, this.writer.password).projects(this.project.id).patch();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should update project and leave `updatedAt` untouched', function *() {
    var result = yield API.$auth(this.admin.email, this.admin.password).projects(this.project.id).patch({
      name: 'new name'
    });
    yield this.project.reload();
    expect(this.project).to.have.property('name', 'new name');
  });
});
