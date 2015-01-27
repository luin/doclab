module.exports = function(options) {
  if (!options) {
    options = {};
  }
  if (typeof options.redirect === 'undefined') {
    options.redirect = true;
  }
  return function *(next) {
    try {
      this.locals.me = yield this.api.users('me').get();
    } catch (err) {
      if (options.redirect) {
        var redirectTo =
          typeof options.redirect === 'string' ? options.redirect : '/account/signin';
        return this.redirect(redirectTo);
      }
    }
    yield next;
  };
};
