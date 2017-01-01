'use strict';

const fs = require('fs');
const rp = require('request-promise');
const BotBrain = require('./botbrain.js');
const MessagesParser = require('./messagesParser.js');


class Narcissus {

    constructor() {
        this.brain = new BotBrain();
    }

    // Get the response to a user message
    getReply(message) {
        return this.brain.getReply(message);
    }

    // Train the bot with Facebook data
    trainWithFacebookMessages(dataExportDirectory) {
        let messagesParser = new MessagesParser(dataExportDirectory + '/html/messages.htm', ['Andy Cho']);
        this._trainChatbot(messagesParser.parse());
    }

    // Use the list of Message objects to train the chatbot
    _trainChatbot(messages) {
        for (const message of messages) {
            this.brain.train(message);
        }
        this.brain.save();
    }
}

module.exports = Narcissus;
