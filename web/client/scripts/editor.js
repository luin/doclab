var Simditor = require('../editor/scripts/simditor');

var editor = new Simditor({
  textarea: $('.js-editor'),
  toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'color', 'ol', 'ul', 'blockquote', 'code', 'table', 'link', 'image', 'hr', 'indent', 'outdent'],
  tabIndent: false
});

require('./editor/layout');

if (doclab.UUID) {
  require('./editor/sync')(editor, doclab.UUID, (doclab.ssl ? 'wss://' : 'ws://') + doclab.host);
}
