/**
 * View where the user is told to select the archive directory
 */

$(document).ready(function() {
  const electron = require('electron');
  const ipc = electron.ipcRenderer;

  const directorySelectionButton = $('#directory-selection-button');

  // Ask the server to show the directory selection dialogue
  function requestDirectorySelection() {
    ipc.send('select-archive-directory', 'yes');
  }

  // Returns true if the folder name is formatted properly
  function isFolderNameValid(folderName) {
    // Find the name of the last folder
    const pathComponents = folderName.split('/');
    const lastFolder = pathComponents[pathComponents.length - 1];
    // Check that the folder name begins with "facebook-" and
    // has stuff after the prefix
    return new RegExp('^facebook-.+$').test(lastFolder);
  }

  // When the user clicks the Select Directory button, ask the server
  // to show the directory selection dialogue
  directorySelectionButton.click(() => {
    requestDirectorySelection();
  });

  // The list of directories selected is passed in arg
  // Show the training view and tell it to start training the model
  // from the directory
  ipc.on('selected-directory', (event, arg) => {
    // The user has not selected a folder (i.e. cancelled the dialogue)
    if (!arg || arg.length === 0) return;

    // Transition if the folder is valid
    const folderName = arg[0];
    if (isFolderNameValid(folderName)) {
      router.showTrainingView();
      $(document).trigger('request-training', folderName);
    } else {
      alert('Sorry, ' + folderName + ' is not a valid folder name. ' +
        'It should be formatted "facebook-USERNAME". '+
        'Please try again.');
    }
  });
});
