var $ = require('jquery');

// tbody.js-team-table
//   each team in teams
//     tr(data-team-id='#{team.id}')
//       td #{team.name}
//       td.center(data-permission='none')
//       td.center(data-permission='read')
//       td.center(data-permission='write')
//       td.center(data-permission='admin')

var permissionOrder = ['none', 'read', 'write', 'admin'];

$('.js-team-table tr').each(function() {
  var $this = $(this);
  var permission = $this.data('permission');
  var teamId = $this.data('teamid');

  var index = permissionOrder.indexOf(permission);
  for (var i = 0; i < permissionOrder.length; ++i) {
    var $e = $('<span class="docicon"/>');
    if (i <= index) {
      $e.addClass('docicon-checked');
    } else {
      $e.addClass('docicon-unchecked');
    }
    $this.children('[data-permission="' + permissionOrder[i] + '"]').append($e);
  }
});
