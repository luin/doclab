var router = module.exports = new (require('koa-router'))();
var middlewares = require('../../middlewares');

router.get('/:projectId', middlewares.me(), middlewares.currentProject({ fetch: { fields: 'collections' } }), function *() {
  yield this.render('projects/show');
});

router.get('/:projectId/settings', middlewares.me(), middlewares.currentProject({ fetch: true }), function *() {
  yield this.render('projects/settings');
});

router.get('/:projectId/settings/permissions', middlewares.me(), middlewares.currentProject({ fetch: { fields: 'teams' } }), function *() {
  var teams = yield this.api.teams.get();
  teams = teams.filter(function(team) {
    return !this.locals.currentProject.teams.find(function(item) {
      return item.id === team.id;
    });
  }, this).map(function(team) {
    team.permission = 'none';
    return team;
  });

  this.locals.teams = this.locals.currentProject.teams.sort(function(a, b) {
    var order = ['read', 'write', 'admin'];
    return order.indexOf(a.permission) - order.indexOf(b.permission);
  }).concat(teams);

  yield this.render('projects/permissions');
});

router.patch('/:projectId', function *() {
  yield this.api.projects(this.params.projectId).patch({
    name: this.request.body.name
  });
  this.flash = { msgs: 'Updated successfully' };
  this.redirect('/projects/' + this.params.projectId + '/settings');
});

router.put('/:projectId/teams/:teamId', function *() {
  this.body = yield this.api.projects(this.params.projectId).teams(this.params.teamId).put({
    permission: this.request.body.permission === 'none' ? null : this.request.body.permission
  });
});

router.get('/:projectId/collections/:collectionId', function *() {
  yield this.render('index');
});

router.post('/:projectId/collections', function *() {
  var collection = yield this.api.projects(this.params.projectId).collections.post({
    name: this.request.body.name,
    description: this.request.body.description
  });
  this.flash = { msgs: 'Create successfully.' };
  this.redirect('/projects/' + this.params.projectId);
});

router.post('/', function *() {
  yield this.api.projects.post({
    name: this.request.body.name
  });

  this.redirect('/');
});

