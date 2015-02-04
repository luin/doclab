var $ = require('jquery');

$(window).resize(autolayout);
autolayout();

function getHeight($element, includeHeight) {
  var height = includeHeight ? $element.height() : 0;
  return height +
         parseInt($element.css('border-top-width'), 10) +
         parseInt($element.css('border-bottom-width'), 10) +
         parseInt($element.css('padding-top'), 10) +
         parseInt($element.css('padding-bottom'), 10);
}

function autolayout() {
  var $body = $('.simditor-body');
  var minHeight = $(window).height() - getHeight($('.simditor-toolbar'), true);
  $body.css('min-height', minHeight + 'px');
}
