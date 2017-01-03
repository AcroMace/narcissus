'use strict';

/**
 * View that allows the user to type in messages and displays the conversation
 */

$(document).ready(function() {
  const MAX_WAIT_BEFORE_REPLY = 1600; // Amount of time to wait before showing reply
  const NEW_BUBBLE_SCROLL_TIME = 800; // Amount of time it takes to scroll for a new bubble

  // jQuery selectors
  const messageInput = $('#input-message'); // The textbar where new messages are entered
  const sendButton = $('#send-button'); // The button pressed to send a message
  const messagesList = $('#messages-list'); // The list where messages are appended
  const messagesListContainer = $('#messages-list-container'); // The container for messages to enable scrolling

  // Get the user's message to send to the chatbot
  function getMessage() {
    return messageInput.val();
  }

  // Clear the input when sending a message
  function clearMessage() {
    return messageInput.val('');
  }

  // Create a chat bubble for yourself
  function createOwnChatBubble(message) {
    return '<div class="chat-bubble-self-container">' +
      '<div class="chat-bubble chat-bubble-self">' +
      message +
      '</div></div>';
  }

  // Create a chat bubble from the bot
  function createReplyChatBubble(message) {
    return '<div class="chat-bubble-other-container">' +
      '<img src="profile.jpg" class="profile-picture">' +
      '<div class="chat-bubble chat-bubble-other">' +
      message +
      '</div></div>';
  }

  // Add the bubble passed in as HTML to the messages list and scroll down to show it
  function addChatBubble(html) {
    messagesList.append(html);
    messagesListContainer.stop().animate({
      scrollTop: messagesListContainer[0].scrollHeight
    }, NEW_BUBBLE_SCROLL_TIME);
  }

  // Show the message you sent in the chat window
  function displayOwnMessage(message) {
    addChatBubble(createOwnChatBubble(message));
  }

  // Show the bot's reply in the chat window
  function displayReply(reply) {
    if (!reply || reply.length === 0) {
      return;
    }

    // Display the reply after a second
    setTimeout(() => {
      addChatBubble(createReplyChatBubble(reply));
    }, MAX_WAIT_BEFORE_REPLY * Math.random());
  }

  // Send the message in the message bar if needed
  function sendMessage() {
    const message = getMessage();
    if (message.length === 0) {
      return;
    }
    clearMessage();

    // Add the message you sent
    displayOwnMessage(message);

    // Add the reply
    displayReply(narcissus.getReply(message).reply);
  }

  // The user hit the send button
  sendButton.click(() => {
    sendMessage();
  });

  // Listen to all events on the message bar
  messageInput.keypress((e) => {
    // The user hit enter
    if (e.which === 13) {
      sendMessage();
    }
  });
});
