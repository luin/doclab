module.exports = function(editor, UUID, websocketAddress) {
  var old = transformValue(editor.getValue());

  var ws = new WebSocket(websocketAddress);

  ws.onerror = function(event) {
    console.log('error', event);
  };

  ws.onopen = function(event) {
    console.log('open', event);
  };

  ws.onmessage = function(event) {
    console.log('message', event);
  };

  setInterval(syncText, 5000);

  function syncText() {
    var value = transformValue(editor.getValue());
    var result = diff(old, value);

    old = value;
  }
};

function transformValue(value) {
  return $(value).map(function() {
    var $this = $(this);
    var tag = $this.prop('tagName').toLowerCase();
    return '<' + tag + '>' + $this.html() + '</' + tag + '>';
  }).get();
}
