'use strict';

/**
 * Wrapper class for the trained bot
 * Can get a reply from the bot or specify a directory to train from
 */

const fs = require('fs');
const rp = require('request-promise');
const BotBrain = require('./botbrain.js');
const ProfileExtractor = require('./profileExtractor.js');
const MessagesParser = require('./messagesParser.js');

const MESSAGES_FILE = '/html/messages.htm';


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
        // Get the name and the profile picture
        let profileExtractor = new ProfileExtractor(dataExportDirectory);
        profileExtractor.copyProfilePicture();
        const names = profileExtractor.fetchNames();

        // Train the bot with the messages
        let messagesParser = new MessagesParser(dataExportDirectory + MESSAGES_FILE, names);
        this._trainChatbot(messagesParser.parse());
    }

    // Check if the bot was already trained
    isAlreadyTrained() {
        return this.brain.isAlreadyTrained();
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
