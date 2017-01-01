var narcissus = new (require('./js/narcissus.js'))(); // Create a Narcissus instance
var router = new (require('./js/router.js'))();

$(document).ready(function() {

  // Initially just show the directorySelection view
  router.showDirectorySelection();

});
