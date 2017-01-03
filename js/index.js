'use strict';

/**
 * Shows the initial view and sets up the global variables
 */

var narcissus = new (require('./js/narcissus.js'))(); // Create a Narcissus instance
var router = new (require('./js/router.js'))();

$(document).ready(function() {

  // Initially just show the directorySelection view
  router.showDirectorySelection();

});
