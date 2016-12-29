$(document).ready(function() {

  const electron = require('electron');
  const ipc = electron.ipcRenderer;

  const loginButton = $('#login-button');

  loginButton.click(function () {
    ipc.send('facebook-login-requested', 'yes');
  });

});
