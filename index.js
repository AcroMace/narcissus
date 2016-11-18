$(document).ready(function() {
  let narcissus = new (require('./narcissus.js'))(); // Create a Narcissus instance

  const MAX_WAIT_BEFORE_REPLY = 1600; // Amount of time to wait before showing reply
  const NEW_BUBBLE_SCROLL_TIME = 300; // Amount of time it takes to scroll for a new bubble

  // Get the user's message to send to the chatbot
  function getMessage() {
    return $('#input-message').val();
  }

  // Create a chat bubble with the given message
  // Set isSelf to true if you sent the message, or false
  // if it's the bot's message
  function createChatBubble(message, isSelf) {
    return '<div class="chat-bubble-' +
      (isSelf ? 'self' : 'other') +
      '-container">' +
      '<div class="chat-bubble chat-bubble-' +
      (isSelf ? 'self' : 'other') +
      '">' +
      message +
      '</div></div>';
  }

  // Add the bubble passed in as HTML to the messages list and scroll down to show it
  function addChatBubble(html) {
    $('#messages').append(html);
    $('#messages-container').stop().animate({
      scrollTop: $('#messages-container')[0].scrollHeight
    }, NEW_BUBBLE_SCROLL_TIME);
  }

  // Show the message you sent in the chat window
  function displayOwnMessage(message) {
    addChatBubble(createChatBubble(message, true));
  }

  // Show the bot's reply in the chat window
  function displayReply(reply) {
    if (!reply || reply.length === 0) { return; }

    // Display the reply after a second
    setTimeout(function () {
      addChatBubble(createChatBubble(reply, false));
    }, MAX_WAIT_BEFORE_REPLY * Math.random());
  }

  // The user hit the send button
  $('#send-button').click(function () {
    const message = getMessage();
    if (message.length === 0) { return; }

    // Add the message you sent
    displayOwnMessage(message);

    // Add the reply
    displayReply(narcissus.getReply(message).reply);
  });
});
