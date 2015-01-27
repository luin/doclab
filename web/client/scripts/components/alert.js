var $ = require('jquery');

$(document).on('click', '.js-alert__close', function(e) {
  e.preventDefault();
  $(this).closest('.js-alert__container').slideUp('fast', function() {
    $(this).remove();
  });
});
