var $ = require('jquery');
require('./editor/layout');
var diff = require('ot-client').diff;
var Simditor = require('../editor/scripts/simditor');
var jsondiffpatch = require('jsondiffpatch').create({
  arrays: {
    detectMove: false
  }
});

var editor = new Simditor({
  textarea: $('#editor'),
  toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'color', 'ol', 'ul', 'blockquote', 'code', 'table', 'link', 'image', 'hr', 'indent', 'outdent'],
  tabIndent: false
});

var ws = new WebSocket((doclab.ssl ? 'wss://' : 'ws://') + doclab.host);

ws.onerror = function(event) {
  console.log('error', event);
};

ws.onopen = function(event) {
  console.log('open', event);
};

ws.onmessage = function(event) {
  console.log('message', event);
};

var transformValue = function(value) {
  return $(value).map(function() {
    var $this = $(this);
    var tag = $this.prop('tagName').toLowerCase();
    return '<' + tag + '>' + $this.html() + '</' + tag + '>';
  }).get();
};

var old = transformValue(editor.getValue());
setInterval(function() {
  var value = transformValue(editor.getValue());
  var result = diff(old, value);

  old = value;
}, 5000);
