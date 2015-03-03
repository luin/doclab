// Sort collection
var initial;

var $sortableCollection = $('.js-sortable--collection').sortable({
  items: '.collections__list__item:not(.collections__list__item--button)',
  placeholder: 'collections__list__item collections__list__item--placeholder',
  stop: function() {
    var ids = getIds();
    var change = getChanged(initial, ids);
    if (change) {
      $.post('/collections/' + change[0] +'/_move', { order: change[1] });
      initial = ids;
    }
  }
});

function getIds() {
  return $sortableCollection.sortable('toArray', {
    attribute: 'data-collection-id'
  });
}

function getChanged(a, b) {
  var length = a.length;
  var skip = 0;
  for (var i = 0; i < length; ++i) {
    if (a[i + skip] === b[i]) {
      continue;
    }
    if (skip === 1) {
      return [b[i], i];
    }
    if (a[i + 1] === b[i]) {
      skip = 1;
    } else {
      return [b[i], i];
    }
  }
}

initial = getIds();
