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
      try {
        this.locals.currentProject = JSON.parse(currentProject);
      } catch (err) {
        this.cookies.set('current-project');
        return this.redirect('/launchpad');
      }
      if (options.fetch) {
        var fetchedProject = yield this.api.projects(this.locals.currentProject.id).get();
        if (fetchedProject.name !== this.locals.currentProject.name) {
          exports.select.call(this, fetchedProject);
        }
        this.locals.currentProject = fetchedProject;
      }
      yield next;
    } else {
      console.log('redirect 2');
      this.redirect('/launchpad');
    }
  };
};

exports.select = function(project) {
  project = JSON.stringify({
    id: project.id,
    name: project.name
  });
  this.cookies.set('current-project', project, {
    expires: new Date(Date.now() + 365 * 24 * 3600 * 1000)
  });
};
