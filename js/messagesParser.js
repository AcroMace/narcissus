'use strict';

/**
 * Parses the messages.htm file from Facebook's data export
 * and creates an array of Message objects
 */

const fs = require('fs');
const htmlparser = require('htmlparser2');
const Message = require('./message.js');

// How often the messages count updates should be sent
// (An update is sent after each UPDATES_INTERVAL messages are parsed)
const UPDATES_INTERVAL = 1024;

/**
 * Finite State Machine Enumerators
 *
 *  -------        -------------
 * | Start | ---> | ThreadStart |
 *  -------        -------------
 *                      | ^
 *              (Start) | | (End)
 *                      V |
 *                 -------------          ---------
 *                | WaitForName | -----> | GetName |
 *                 -------------          ---------
 *                       ^                    |
 *                       |                    V
 *                 ------------        ----------------
 *                | GetMessage | <--- | WaitForMessage |
 *                 ------------        ----------------
 *
 */
const START_STATE = 1;
const WAIT_FOR_NAME_STATE = 2;
const GET_NAME_STATE = 3;
const WAIT_FOR_MESSAGE_STATE = 4;
const GET_MESSAGE_STATE = 5;


class MessagesParser {

  // messagesFile: The path (string) to the messages.htm file
  // ownNames: An array of strings of the names of yourself
  // updatesCallback: A callback to send the progress of how many messages
  //                  habe been analyzed
  constructor(messagesFile, ownNames, updatesCallback) {
    this._messagesFile = messagesFile;
    // This is used to check if a message was sent by yourself since it is not
    //  explicitly marked on a message - only the sender's name is known.
    // It needs to be an array since the sender's name is the name it was when
    //  the message was sent and the user may have changed their names.
    // Group messages also sent from NUMBER@facebook.com, so it's not currently
    //  possible to parse messages from group conversations.
    this._ownNames = ownNames;
    this._resetState();
    // The state from the Finite State Machine
    this._state = START_STATE;
    // Messaged saved after parsing
    this._messages = [];
    // Message index number
    this._messageIndex = 0;
    // Save the callback
    this._updatesCallback = updatesCallback;
  }

  parse(callback) {
    let self = this;
    const parser = new htmlparser.Parser({
      // Call the appropriate state change handlers when matching
      // open tags are opened
      onopentag: (name, attribs) => {
        if (name === 'div' && attribs.class === 'thread') {
          self._handleThreadStart(self);
        } else if (name === 'span' && attribs.class === 'user') {
          self._handleNameStart(self);
        } else if (name === 'p') {
          self._handleMessageStart(self);
        }
      },
      ontext: (text) => {
        self._handleText(self, text);
      }}, {
        decodeEntities: false
      });

    // Read the messages file
    fs.readFile(this._messagesFile, 'utf8', (err, data) => {
      if (err) throw err;

      parser.write(data);
      parser.end();
      callback(self._messages);
    });
  }

  // Reset the state variables
  _resetState() {
    this._lastName = null;            // The last name parsed
    this._lastMessage = null;         // The last message parsed
    this._secondToLastName = null;    // Second to last name parsed
    this._secondToLastMessage = null; // Second to last message parsed
  }

  // A new conversation thread has started
  // All state must be cleared
  _handleThreadStart(self) {
    // Clear state variables when the thread starts
    self._resetState();
    // We can automatically tansition from THREAD_START_STATE
    // to WAIT_FOR_NAME_STATE
    self._state = WAIT_FOR_NAME_STATE;
  }

  // The name is about to be received
  _handleNameStart(self) {
    self._state = GET_NAME_STATE;
  }

  // The message is about to be received
  _handleMessageStart(self) {
    self._state = GET_MESSAGE_STATE;
  }

  // Text (i.e. anything that's not a tag) was found
  // The contents are passed as a string
  _handleText(self, text) {
    if (self._state === GET_NAME_STATE) {
      // Save the last received name
      self._secondToLastName = self._lastName;
      // Save the new name
      self._lastName = text.trim();
      // Get the next message
      self._state = WAIT_FOR_MESSAGE_STATE;
    } else if (self._state === GET_MESSAGE_STATE) {
      // Save the last received message
      self._secondToLastMessage = self._lastMessage;
      // Save the new message
      self._lastMessage = text.trim();
      // Check to see if a prompt-reply pair was created
      // Someone else sent the second to last message
      const secondToLastMessageSentBySelf = self._checkIfOwnMessage(self, self._secondToLastName);
      // and you sent the last message
      const lastMessageSentBySelf = self._checkIfOwnMessage(self, self._lastName);
      if (lastMessageSentBySelf && !secondToLastMessageSentBySelf && self._secondToLastName !== null) {
        self._messages.push(new Message(self._messageIndex, self._secondToLastMessage, self._lastMessage));
        self._messageIndex++;

        // Send a progress update
        if (self._messageIndex % UPDATES_INTERVAL === 0) {
          self._updatesCallback(self._messageIndex);
        }
      }
      self._state = WAIT_FOR_NAME_STATE;
    }
  }

  // Check if the given name is your own name
  _checkIfOwnMessage(self, name) {
    return self._ownNames.indexOf(name) >= 0;
  }

}

module.exports = MessagesParser;
