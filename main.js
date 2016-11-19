'use strict';

const electron = require('electron');
const FB = require('fb');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;

let mainWindow;

// Login to Facebook
// https://github.com/nageshpodilapu/Using-Facebook-Twitter-API-with-Electron-Application
function loginToFacebook() {
  const options = {
    client_id: '1923713667847998',
    scopes: 'public_profile',
    redirect_uri: escape('https://www.facebook.com/connect/login_success.html')
  };
  let authWindow = new BrowserWindow({
    width: 400,
    height: 300,
    show: false,
    webPreferences: {
      // Stop the "caching disabled" error (https://github.com/electron/electron/issues/2848)
      nodeIntegration: false,
      // Required for Facebook pinging
      webSecurity: false,
      plugins: true
    }
  });
  const facebookAuthURL = "https://www.facebook.com/v2.3/dialog/oauth?client_id=" + options.client_id + "&redirect_uri=" + options.redirect_uri + "&response_type=token,granted_scopes&scope=" + options.scopes + "&display=popup";
  authWindow.loadURL(facebookAuthURL);
  authWindow.show();
  authWindow.webContents.on('did-get-redirect-request', function (event, oldURL, newURL) {
    console.log('New URL: ' + newURL);
    const raw_code = /access_token=([^&]*)/.exec(newURL) || null;
    const access_token = (raw_code && raw_code.length > 1) ? raw_code[1] : null;
    if (access_token) {
      FB.setAccessToken(access_token);
      FB.api('/me', { fields: ['id', 'name', 'picture.width(800).height(800)'] }, function (res) {
        mainWindow.webContents.executeJavaScript('document.getElementById("fb-name").innerHTML = " Name: ' + res.name + '"');
        mainWindow.webContents.executeJavaScript('document.getElementById("fb-id").innerHTML = " ID: ' + res.id + '"');
        mainWindow.webContents.executeJavaScript('document.getElementById("fb-dp").src = "' + res.picture.data.url + '"');
      });
      authWindow.close();
    }
  });
}

app.on('ready', function() {
  console.log('ready');

  // Init the Facebook SDK
  FB.init({
    appId: '1923713667847998',
    version: 'v2.3'
  });

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
    loginToFacebook();
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});

app.on('window-all-closed', function() {
  app.quit();
});
