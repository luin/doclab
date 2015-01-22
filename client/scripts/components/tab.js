var $ = require('jquery');

$(document).on('click', '.js-tab__target', function(e) {
  e.preventDefault();

  var $this = $(this);
  if ($this.hasClass('is-active')) {
    return;
  }
  var $container = $this.closest('.js-tab__container');
  var tabName = $this.data('tab');

  $container.find('.js-tab__target').removeClass('is-active');
  $this.addClass('is-active');

  var $contents = $container.find('.js-tab__content').removeClass('is-active');
  var $activeContent = $contents.filter('[data-tab="' + tabName + '"]').addClass('is-active');
  $container.trigger('tabchanged', tabName, $activeContent);
});
