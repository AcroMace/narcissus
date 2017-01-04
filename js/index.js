'use strict';

/**
 * Shows the initial view and sets up the global variables
 */

let narcissus = new (require('./js/narcissus.js'))(); // Create a Narcissus instance
let router = new (require('./js/router.js'))();

$(document).ready(function() {
  if (narcissus.isAlreadyTrained()) {
    // If the bot is already trained, go straight into chat
    router.showChat();
  } else {
    // If not, give the user instructions on how to train it
    router.showDirectorySelection();
  }
});

// Open links through the browser (instead of redirecting in the app)
// https://github.com/electron/electron/issues/1344
$(document).on('click', 'a[href^="http"]', function(event) {
  event.preventDefault();
  require('electron').shell.openExternal(this.href);
});
