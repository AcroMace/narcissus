'use strict';

const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;

let mainWindow;

app.on('ready', function() {
  console.log('ready');

  // Create the window and display the index page
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 400,
    minHeight: 300
  });
  mainWindow.loadURL(`file://${__dirname}/index.html`)

  // Start OAuth flow with Facebook when requested
  ipc.on('facebook-login-requested', function() {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }, function (directories) {
      console.log(directories);
    });
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  app.quit();
});
