$(document).ready(function() {

  const electron = require('electron');
  const ipc = electron.ipcRenderer;

  const directorySelectionButton = $('#directory-selection-button');

  directorySelectionButton.click(function () {
    ipc.send('select-archive-directory', 'yes');
  });

  ipc.on('selected-directory', (event, arg) => {
    $(document).trigger('request-training', arg[0]);
  });

});
