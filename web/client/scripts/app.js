$(document).pjax('#pjaxContainer a:not([data-nopjax])', '#pjaxContainer', {
  fragment: '#pjaxContainer'
});
var NProgress = require('nprogress');
$(document).on('pjax:send', function() {
  NProgress.start();
});
$(document).on('pjax:complete', function() {
  NProgress.done();
});
$(document).on('submit', 'form[data-pjax]', function(event) {
  $.pjax.submit(event, '#pjaxContainer');
});

require('./components');

require('./pages/index');
require('./pages/projects_permissions');
require('./pages/settings_profile');

require('./vendors/jquery.mjs.nestedsortable.js');
require('./pages/doc');
