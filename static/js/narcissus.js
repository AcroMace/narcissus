$(document).ready(function() {

  // Get the user's message to send to the chatbot
  function getMessage() {
    return $('#input-message').val();
  }

  // Send the message specified and call the callback with the response
  function sendMessage(message, callback) {
    console.log('Sending message: ' + message);
    $.get('http://127.0.0.1:5000/chat/' + message, function (data) {
      callback(data);
    });
  }

  // The user hit the send button
  $('#send-button').click(function () {
    const message = getMessage();
    if (message.length == 0) { return; }

    sendMessage(message, function(response) {
      alert(response);
    });
  });
});
