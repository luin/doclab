var $ = require('jquery');

$('[data-modal]').each(function() {
  var $this = $(this);
  var $modal = $('#' + $this.attr('data-modal'));

  $modal.click(function() {
    $modal.removeClass('is-active');
  });

  $modal.find('.modal__container').click(function(e) {
    e.stopPropagation();
  });

  $modal.find('[data-modal-dismiss]').click(function() {
    $modal.removeClass('is-active');
  });

  $this.click(function() {
    $modal.addClass('is-active');
    return false;
  });
});

