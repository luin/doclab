var NProgress = require('nprogress');

$('.js-file-form').submit(function(e) {
  NProgress.start();
  var $this = $(this);
  $.ajax({
    url: $this.attr('action'),
    type: 'POST',
    data: new FormData(this),
    processData: false,
    contentType: false
  }).done(function(user) {
    NProgress.done();
    $('.js-avatar-preview').attr('src', user.avatarOrig);
  }).fail(function(err) {
    NProgress.done();
    alert(err.responseJSON.error || err.responseText);
  });
  e.preventDefault();
});
