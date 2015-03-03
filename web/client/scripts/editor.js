var Simditor = require('../editor/scripts/simditor');

var editor = new Simditor({
  textarea: $('.js-doc-editor'),
  toolbar: ['title', 'bold', 'italic', 'underline', 'strikethrough', 'color', 'ol', 'ul', 'blockquote', 'code', 'table', 'link', 'image', 'hr', 'indent', 'outdent'],
  tabIndent: false
});

require('./editor/layout');

$('.js-doc-form').submit(function(event) {
  event.preventDefault();

  var $this = $(this);
  var action = $this.attr('action');
  var title = $('input[name="title"]').val() || 'Untitled';
  var body = editor.getValue();

  if (doclab.UUID) {
  } else {
    console.log(body);
    $.api.post(action, {
      title: title,
      content: body
    }, function(data) {
      console.log(data);
    });
  }
});

if (doclab.UUID) {
  require('./editor/sync')(editor, doclab.UUID, (doclab.ssl ? 'wss://' : 'ws://') + doclab.host);
}
