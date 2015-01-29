var $ = require('jquery');

var permissionOrder = ['none', 'read', 'write', 'admin'];

$(document).on('ready pjax:success', function() {
  $('.js-permission-table tbody tr').each(function() {
    var $this = $(this);
    var currentPermission = $this.data('permission');
    var teamId = $this.data('teamid');

    function updateTable() {
      var index = permissionOrder.indexOf(currentPermission);
      for (var i = 0; i < permissionOrder.length; ++i) {
        var $e = $('<span class="docicon"/>');
        if (i <= index) {
          $e.addClass('docicon-checked');
        } else {
          $e.addClass('docicon-unchecked');
        }
        $this.children('[data-permission="' + permissionOrder[i] + '"]').empty().append($e);
      }
    }
    updateTable();

    $this.on('click', '[data-permission] .docicon', function() {
      var $_this = $(this);
      var permission = $_this.closest('[data-permission]').data('permission');
      if (currentPermission === permission) {
        return;
      }
      var $loading = $this.find('.loading');
      $loading.addClass('is-loading').removeClass('is-done');

      $.api.put('/projects/' + currentProjectId + '/teams/' + teamId, {
        permission: permission
      }, function(err, result) {
        if (err) {
          alert(err.error);
          return;
        }
        currentPermission = result.permissions.current || 'none';
        updateTable();
        $loading.addClass('is-done');
      });
    });
  });
});
