var $ = require('jquery');

var isMenuBgInserted = false;
var $currentContainer;

var $menuBg = $('<div/>').css({
  position: 'fixed',
  left: '0',
  top: '0',
  width: '100%',
  height: '100%',
  zIndex: 100,
  userSelect: 'none'
}).click(function() {
  $menuBg.hide();
  $currentContainer.removeClass('is-active');
});

$(document).on('click', '.js-menu__target', function(e) {
  $currentContainer = $(this).closest('.js-menu__container').addClass('is-active');
  var $content = $currentContainer.find('.js-menu__content');
  if (isMenuBgInserted) {
    $menuBg.show();
  } else {
    $('body').append($menuBg);
    isMenuBgInserted = true;
  }
  e.preventDefault();
});
