if (top !== window) {
  alert('For security reasons, framing is not allowed.');
  top.location.replace(document.location);
}

window.$ = window.jQuery = require('jquery');
require('jquery-ui/sortable');

window.NProgress = require('nprogress');

require('./plugins/jquery-api');
require('./vendors/jquery-pjax');
