'use strict';

/**
 * This is the server Javascript file used by Electron.
 * The client-side Javascript files are in the js folder.
 */

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

  // Select the directory with the exported data from Facebook
  ipc.on('select-archive-directory', (event, arg) => {
    dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    }, function (directories) {
      event.sender.send('selected-directory', directories);
    });
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  app.quit();
});
