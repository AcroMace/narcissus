$(document).ready(function() {
  let narcissus = new (require('./narcissus.js'))(); // Create a Narcissus instance

  // Get the user's message to send to the chatbot
  function getMessage() {
    return $('#input-message').val();
  }

  // The user hit the send button
  $('#send-button').click(function () {
    const message = getMessage();
    if (message.length == 0) { return; }

    alert(narcissus.getReply(message).reply);
  });
});
