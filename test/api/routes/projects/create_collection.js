describe('POST /projects/:projectId/collections', function() {
  beforeEach(function *() {
    yield fixtures.load();
    this.writer = fixtures.users[1];
    this.reader = fixtures.users[2];
    yield this.writer.addTeam(fixtures.teams[0]);
    yield this.reader.addTeam(fixtures.teams[1]);
    this.project = fixtures.projects[0];
    yield fixtures.teams[0].addProject(this.project, { permission: 'write' });
    yield fixtures.teams[1].addProject(this.project, { permission: 'read' });
  });

  it('should return Unauthorized when user is unauthorized', function *() {
    try {
      yield route.post(`/projects/${this.project.id}/collections`);
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    try {
      yield route.post(`/projects/${this.project.id}/collections`, null, {
        auth: [this.reader.email, this.reader.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    try {
      yield route.post(`/projects/${this.project.id}/collections`, null, {
        auth: [this.writer.email, this.writer.password]
      });
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create a new collection', function *() {
    var collection = yield route.post(`/projects/${this.project.id}/collections`, {
      name: 'new name',
      description: 'new description'
    }, {
      auth: [this.writer.email, this.writer.password]
    });
    expect(collection.name).to.eql('new name');
    expect(collection.description).to.eql('new description');
    expect(collection.ProjectId).to.eql(this.project.id);
  });
});
