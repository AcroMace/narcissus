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
