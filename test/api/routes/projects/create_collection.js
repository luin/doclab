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
      yield API.projects(this.project.id).collections.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.Unauthorized);
    }
  });

  it('should return NoPermission when the user don\'t have write permission', function *() {
    try {
      yield API.$auth(this.reader.email, this.reader.password).projects(this.project.id).collections.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.NoPermission);
    }
  });

  it('should return InvalidParameter when parameters are invalid', function *() {
    var base = API.$auth(this.writer.email, this.writer.password).projects(this.project.id).collections;
    try {
      yield base.post();
      throw new Error('should reject');
    } catch (err) {
      expect(err).to.be.an.error(HTTP_ERROR.InvalidParameter);
    }
  });

  it('should create a new collection', function *() {
    var collection = yield API.$auth(this.writer.email, this.writer.password).projects(this.project.id).collections.post({
      name: 'new name'
    });
    expect(collection.name).to.eql('new name');
    expect(collection.ProjectId).to.eql(this.project.id);
  });
});
