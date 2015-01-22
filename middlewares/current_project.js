exports = module.exports = function(options) {
  if (!options) {
    options = {};
  }
  if (typeof options.fetch === 'undefined') {
    options.fetch = false;
  }
  return function *(next) {
    var currentProject = this.cookies.get('current-project');
    if (currentProject) {
      currentProject = currentProject.split('|');
      this.locals.currentProject = {
        id: currentProject[0],
        name: currentProject[1]
      };
      if (typeof this.params.projectId !== 'undefined' &&
          this.locals.currentProject.id !== this.params.projectId) {
        this.locals.currentProject = exports.select.call(this, yield this.api.projects(this.params.projectId).get());
      }
      if (options.fetch) {
        var fetchedProject = yield this.api.projects(this.locals.currentProject.id).get(
          typeof options.fetch === 'object' ? options.fetch : undefined
        );
        if (fetchedProject.name !== this.locals.currentProject.name) {
          exports.select.call(this, fetchedProject);
        }
        this.locals.currentProject = fetchedProject;
      }
      yield next;
    } else {
      this.redirect('/launchpad');
    }
  };
};

exports.select = function(project) {
  this.cookies.set('current-project', [project.id, project.name].join('|'), {
    expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)
  });
  return {
    id: project.id,
    name: project.name
  };
};
