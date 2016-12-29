// Parses the messages.htm file from Facebook's data export
// and creates an array of Message objects

const fs = require('fs');
const htmlparser = require('htmlparser2');
const Message = require('./message.js');

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
const THREAD_START_STATE = 2;
const WAIT_FOR_NAME_STATE = 3;
const GET_NAME_STATE = 4;
const WAIT_FOR_MESSAGE_STATE = 5;
const GET_MESSAGE_STATE = 6;

class MessagesParser {

  // messagesFile: The path (string) to the messages.htm file
  // ownNames: An array of strings of the names of yourself
  //   This is used to check if a message was sent by yourself since it is not
  //   explicitly marked on a message - only the sender's name is known
  //   It needs to be an array since the sender's name is the name it was when
  //   the message was sent and the user may have changed their names
  //   Group messages also sent from NUMBER@facebook.com, so it's not currently possible
  //   to parse messages from group conversations.
  constructor(messagesFile, ownNames) {
    this._messagesFile = messagesFile;
    this._state = START_STATE;
    this._lastName = null;
    this._lastMessage = null;
  }

  parse() {
    let self = this;
    const parser = new htmlparser.Parser({
      // Call the appropriate state change handlers when matching
      // open tags are opened
      onopentag: function (name, attribs) {
        if (name === 'div' && attribs.class === 'thread') {
          self._handleThreadStart(self);
        } else if (name === 'span' && attribs.class === 'user') {
          self._handleNameStart(self);
        } else if (name === 'p') {
          self._handleMessageStart(self);
        }
      },
      ontext: function (text) {
        self._handleText(self, text);
      }
    }, { decodeEntities: true });

    // Read the messages file
    // htmlparser2 supports streaming - this should probably use a stream instead
    parser.write(fs.readFileSync(this._messagesFile, 'utf8'));
    // The parsing can end immediately after since readFileSync reads the entire
    // file synchronously - there's no more data that needs to be parsed
    parser.end();
  }

  // A new conversation thread has started
  // All state must be cleared
  _handleThreadStart(self) {
    // Clear state variables when the thread starts
    self._lastName = null;
    self._lastMessage = null;
    // We can automatically tansition from THREAD_START_STATE
    // to WAIT_FOR_NAME_STATE
    console.log('Thread start');
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
      console.log('Got name:', text);
      self._state = WAIT_FOR_MESSAGE_STATE;
    } else if (self._state === GET_MESSAGE_STATE) {
      console.log('Got message:', text);
      self._state = WAIT_FOR_NAME_STATE;
    }
  }

}

module.exports = MessagesParser;

let messagesParser = new MessagesParser('../messages.htm', ['Andy Cho']);
messagesParser.parse();
