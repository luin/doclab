var $ = require('jquery');

$(document).on('click', '.js-form__target', function(e) {
  $(this).closest('.js-form__container').submit();
  e.preventDefault();
});
