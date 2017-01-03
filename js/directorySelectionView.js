/**
 * View where the user is told to select the archive directory
 */

$(document).ready(function() {
  const electron = require('electron');
  const ipc = electron.ipcRenderer;

  const directorySelectionButton = $('#directory-selection-button');

  // When the user clicks the Select Directory button, ask the server
  // to show the directory selection dialogue
  directorySelectionButton.click(() => {
    ipc.send('select-archive-directory', 'yes');
  });

  // The list of directories selected is passed in arg
  // Show the training view and tell it to start training the model
  // from the directory
  ipc.on('selected-directory', (event, arg) => {
    router.showTrainingView();
    $(document).trigger('request-training', arg[0]);
  });
});
