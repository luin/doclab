var $ = require('jquery');

$('.js-form__target').click(function(e) {
  $(this).closest('.js-form__container').submit();
  e.preventDefault();
});

$('.js-form__auto-submit').change(function() {
  var $this = $(this);
  if ($this.val()) {
    setTimeout(function() {
      $this.closest('form').submit();
    }, 100);
  }
});
