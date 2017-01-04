'use strict';

/**
 * A wrapper class for generating messages using Lunr
 */

const lunr = require('lunr');
const fs = require('fs');
const path = require('path');

const MAX_REPLIES_CONSIDERED = 100;
const LUNR_INDEX_FILE = 'lunrIndex.json';
const MESSAGES_FILE = 'indexedMessages.json';


class BotBrain {

  constructor() {
    // Flag to check if the bot was already trained (i.e. if the index and
    // the messages file exist)
    this._isAlreadyTrained = false;
    // Get a reference to the lunr instance
    this._lunrIndex = this._getLunrInstance();
    this._messages = this._getMessages();
  }

  // Train the bot to reply given the Message object
  train(message) {
    let messageCopy = {
      id: message.id,
      prompt: message.prompt,
      reply: message.reply
    };
    this._messages[message.id] = messageCopy; // Save the message
    this._lunrIndex.add(messageCopy); // Index the message
  }

  // Get a reply from the bot given a prompt
  getReply(prompt) {
    // Just get the top 3 search results and randomly choose one of the replies
    // using the score for each reply as its weight
    const searchResults = this._lunrIndex.search(prompt);
    const replies = searchResults.slice(0, MAX_REPLIES_CONSIDERED);
    const totalScore = replies.map((obj) => obj.score).reduce((a, b) => a + b, 0);
    const randomScore = Math.random() * totalScore;

    // If nothing is found, try again with the longest word
    if (replies.length === 0) {
      // Sort words by descending word length and try to find some reply
      const words = prompt.split(' ').sort((a, b) => b.length - a.length);
      // Base case
      if (words.length <= 1) {
        return;
      }
      for (const word of words) {
        const replyForWord = this.getReply(word);
        if (replyForWord !== null) {
          return replyForWord;
        }
      }
      return null;
    }

    // Get a weighted random reply
    let currentScore = 0;
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

  // Return true if the model is already trained
  isAlreadyTrained() {
    return this._isAlreadyTrained;
  }

  // Reloads a previously saved Lunr instance or creates a new one and then returns the instance
  // This method is synchronous as it's called from the constructor
  _getLunrInstance() {
    try {
      // Parse the JSON and send it back
      let instance = lunr.Index.load(JSON.parse(fs.readFileSync(path.join(__dirname, '..', LUNR_INDEX_FILE), 'utf8')));
      console.log('Found old Lunr instance');
      this._isAlreadyTrained = true;
      return instance;
    } catch (err) {
      // Couldn't read the file or it wasn't JSON - create a new Lunr instance
      console.log('Indexed messages not found or it was not JSON - creating new instance.');
      console.log(err);
      this._isAlreadyTrained = false;
      return this._createLunrNewInstance();
    }
  }

  // Create a new Lunr instance
  _createLunrNewInstance() {
    // Just index the prompt field
    return lunr(function() {
      // Using "this" here is required by lunr
      /* eslint-disable no-invalid-this */
      this.field('prompt');
      this.ref('id');
      // Disable removing stopwords
      // This results in a larger/slower index but it makes for a
      // better chatting experience
      this.pipeline.remove(lunr.stopWordFilter)
      /* eslint-enable no-invalid-this */
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
      return JSON.parse(fs.readFileSync(path.join(__dirname, '..', MESSAGES_FILE), 'utf8'));
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
    fs.writeFile(path.join(__dirname, '..', fileName), serializedObject, function(err) {
      if (err) {
        console.error('Could not save ' + fileName);
      } else {
        console.log('Succesfully saved ' + fileName);
      }
    });
  }

}

module.exports = BotBrain;
