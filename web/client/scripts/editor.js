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

if (doclab.UUID) {
  require('./editor/sync')(editor, doclab.UUID, (doclab.ssl ? 'wss://' : 'ws://') + doclab.host);
}
