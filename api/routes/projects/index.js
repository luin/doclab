var router = module.exports = new (require('koa-router'))();
var _ = require('lodash');

router.post('/', function *() {
  this.assert(this.me.isOwner, new HTTP_ERROR.NoPermission());

  var body = this.request.body;
  this.assert(body.name, new HTTP_ERROR.InvalidParameter('name is required'));

  this.body = yield Project.create({ name: body.name });
});

router.get('/', function *() {
  var projects;

  if (this.me.isOwner) {
    projects = yield Project.findAll();
    projects.forEach(function(project) {
      project.setDataValue('ProjectTeam', { permission: 'admin' });
    });
  } else {
    var teams = yield this.me.getTeams();
    projects = {};
    var mergeProjectsByPermission = function(project) {
      if (projects[project.id]) {
        var currentPermission = projects[project.id].ProjectTeam.permission;
        var newPermission = project.ProjectTeam.permission;
        if (ProjectTeam.higherPermission(currentPermission, newPermission) === newPermission) {
          projects[project.id] = project;
        }
      } else {
        projects[project.id] = project;
      }
    };
    for (var i = 0; i < teams.length; ++i) {
      var team = teams[i];
      var teamProjects = yield team.getProjects();
      teamProjects.forEach(mergeProjectsByPermission);
    }

    projects = Object.keys(projects).map(function(id) {
      return projects[id];
    });
  }

  var _this = this;

  if (this.query.permission) {
    projects = projects.filter(function(project) {
      return project.ProjectTeam.permission === _this.query.permission;
    });
  }

  if (this.query.sort) {
    var field = this.query.sort.slice(1);
    projects = projects.sort(function(a, b) {
      return (a[field] - b[field]) * (_this.query.sort[0] === '+' ? 1 : -1);
    });
  }


  projects.forEach(function(project) {
    project = project.dataValues;
    project.permission = project.ProjectTeam.permission;
    delete project.ProjectTeam;
  });

  this.body = projects;
});

router.param('projectId', function *(id, next) {
  this.project = yield Project.find(id);
  this.assert(this.project, new HTTP_ERROR.NotFound('Project %s', id));
  yield next;
});

router.get('/:projectId', function *() {
  this.assert(yield this.me.havePermission(this.project, 'read'),
              new HTTP_ERROR.NoPermission());

  if (this.query.fields) {
    var fields = this.query.fields.split(',');
    if (fields.indexOf('collections') !== -1) {
      var collections = yield this.project.getCollections();
      this.project.setDataValue('collections', collections.sort(function(a, b) {
        if (typeof a.order === 'number' && typeof b.order === 'number') {
          return a.order - b.order;
        } else {
          return a.createdAt - b.createdAt;
        }
      }));
    }
    if (fields.indexOf('teams') !== -1) {
      var teams = yield this.project.getTeams();
      this.project.setDataValue('teams', teams.map(function(team) {
        return {
          id: team.id,
          name: team.name,
          createdAt: team.ProjectTeam.createdAt,
          permission: team.ProjectTeam.permission
        };
      }));
    }
  }

  this.body = this.project;
});

router.patch('/:projectId', function *() {
  this.assert(yield this.me.havePermission(this.project, 'admin'),
              new HTTP_ERROR.NoPermission());

  var properties = ['name'];
  _.intersection(properties, Object.keys(this.request.body)).forEach(function(key) {
    this.project[key] = this.request.body[key];
  }, this);

  var changed = this.project.changed();
  if (changed) {
    yield this.project.save({ silent: true });
  }
  this.body = { changedProperties: changed || [] };
});

router.post('/:projectId/collections', function *() {
  this.assert(yield this.me.havePermission(this.project, 'write'),
              new HTTP_ERROR.NoPermission());

  var collection = yield Collection.create({
    name: this.request.body.name,
    description: this.request.body.description,
    ProjectId: this.project.id
  });

  yield News.create({
    type: 'collection.create',
    content: {
      name: collection.name
    },
    ProjectId: this.params.projectId,
    CollectionId: collection.id,
    UserId: this.me.id
  });

  this.body = collection;
});

router.put('/:projectId/teams/:teamId', function *() {
  this.assert(yield this.me.havePermission(this.project, 'admin'), new HTTP_ERROR.NoPermission());
  this.assert(typeof this.request.body.permission !== 'undefined',
              new HTTP_ERROR.InvalidParameter('permission is required'));

  var team = yield Team.find({
    where: { id: this.params.teamId },
    attributes: ['id']
  });
  this.assert(team, new HTTP_ERROR.NotFound());
  var relation = yield ProjectTeam.find({
    where: { TeamId: team.id, ProjectId: this.project.id }
  });
  var previous = relation ? relation.permission : null;
  var current = this.request.body.permission;
  if (previous !== current) {
    if (relation) {
      if (current) {
        relation.permission = current;
        yield relation.save();
      } else {
        yield relation.destroy();
      }
    } else {
      yield this.project.addTeams(team, { permission: current });
    }
  }
  this.body = {
    permissions: { previous: previous, current: current }
  };
});
