'use strict';

/**
 * A loading screen while the bot is trained
 */

$(document).on('request-training', function(event, dataExportDirectory) {
  const trainingUpdates = $('#training-updates');

  // Show the string update message to the user
  function displayUpdateMessage(updateMessage) {
    console.log(updateMessage);
    trainingUpdates.text(updateMessage);
  }

  // Handle an update message
  function handleUpdate(update) {
    if (update.type === 'messageCount') {
        displayUpdateMessage('Learning from message #' + update.count);
      } else if (update.type === 'profilePicture') {
        displayUpdateMessage('Getting the profile picture');
      } else if (update.type === 'name') {
        displayUpdateMessage('Finding your name');
      } else if (update.type === 'messagesStart') {
        displayUpdateMessage('Fetching messages');
      } else {
        console.error('Unrecognized update type');
        console.error(update);
      }
  }

  setTimeout(function() {
    narcissus.trainWithFacebookMessages(dataExportDirectory, handleUpdate, () => {
      router.showChat();
    });
  }, 100);
});
