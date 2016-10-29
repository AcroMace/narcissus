'use strict';

const lunr = require('lunr');
const fs = require('fs');
const Message = require('./message.js');

const MAX_REPLIES_CONSIDERED = 3;
const LUNR_INDEX_FILE = 'lunrIndex.json';
const MESSAGES_FILE = 'indexedMessages.json';

// A wrapper class for generating messages using Lunr

class BotBrain {

  constructor() {
    // Get a reference to the lunr instance
    this._lunrIndex = this._getLunrInstance();
    this._messages = this._getMessages();
  }

  // Train the bot to reply given the Message object
  train(message) {
    var message = {
      id: message.id,
      prompt: message.prompt,
      reply: message.reply,
    };
    this._messages[message.id] = message; // Save the message
    this._lunrIndex.add(message); // Index the message
  }

  // Get a reply from the bot given a prompt
  getReply(prompt) {
    // Just get the top 3 search results and randomly choose one of the replies
    // using the score for each reply as its weight
    const searchResults = this._lunrIndex.search(prompt);
    const replies = searchResults.slice(0, MAX_REPLIES_CONSIDERED);
    const totalScore = replies.map(obj => obj.score).reduce((a, b) => a + b, 0);
    const randomScore = Math.random() * totalScore;
    // If nothing is found, return a question mark
    if (replies.length === 0) {
      return '?';
    }
    // Get a weighted random reply
    var currentScore = 0;
    for (const reply of replies) {
      currentScore += reply.score;
      if (randomScore <= currentScore) {
        return this._messages[reply.ref];
      }
    }
    // If there's some weird floating point thing, return the last message
    return this._messages[replies[replies.length - 1].ref];
  }

  // Save the brain after training
  save() {
    this._saveLunrIndex();
    this._saveMessages();
  }

  // Reloads a previously saved Lunr instance or creates a new one and then returns the instance
  // This method is synchronous as it's called from the constructor
  _getLunrInstance() {
    try {
      // Parse the JSON and send it back
      let instance = lunr.Index.load(JSON.parse(fs.readFileSync(LUNR_INDEX_FILE, 'utf8')));
      console.log('Found old Lunr instance');
      return instance;
    } catch (err) {
      // Couldn't read the file or it wasn't JSON - create a new Lunr instance
      console.log('Indexed messages not found or it was not JSON - creating new instance.');
      return this._createLunrNewInstance();
    }
  }

  // Create a new Lunr instance
  _createLunrNewInstance() {
    // Just index the prompt field
    return lunr(function() {
      this.field('prompt');
      this.ref('id');
    });
  }

  // Save the Lunr index to a file
  _saveLunrIndex() {
    this._saveFile(LUNR_INDEX_FILE, this._lunrIndex);
  }

  // Get the messages from the saved file
  // Returns an empty object if there were no previous saved messages
  _getMessages() {
    try {
      return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
    } catch (err) {
      return {};
    }
  }

  // Save the indexed messages to a file
  _saveMessages() {
    this._saveFile(MESSAGES_FILE, this._messages);
  }

  // Serialize the object and save it with the file name
  _saveFile(fileName, obj) {
    const serializedObject = JSON.stringify(obj);
    fs.writeFile(fileName, serializedObject, function (err) {
      if (err) {
        console.error('Could not save ' + fileName);
      } else {
        console.log('Succesfully saved ' + fileName);
      }
    });
  }

}

module.exports = BotBrain;
