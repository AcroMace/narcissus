'use strict';

/**
 * A loading screen while the bot is trained
 */

$(document).on('request-training', function(event, dataExportDirectory) {

  setTimeout(function() {
    narcissus.trainWithFacebookMessages(dataExportDirectory);
    router.showChat();
  }, 100);

});
