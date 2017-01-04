'use strict';

/**
 * Wrapper class for the trained bot
 * Can get a reply from the bot or specify a directory to train from
 */

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
        const reply = this.brain.getReply(message);
        return reply ? reply : '?';
    }

    // Train the bot with Facebook data
    // Sends updates on the progress to the callback
    trainWithFacebookMessages(dataExportDirectory, updatesCallback, completionCallback) {
        // Copy the user's profile picture to the current directory
        updatesCallback({ type: 'profilePicture' });
        let profileExtractor = new ProfileExtractor(dataExportDirectory);
        profileExtractor.copyProfilePicture();

        // Fetch the user's current and previous names
        updatesCallback({ type: 'name' });
        const names = profileExtractor.fetchNames();

        // Train the bot with the messages
        updatesCallback({ type: 'messagesStart' });
        const messagesFilePath = dataExportDirectory + MESSAGES_FILE;
        let messagesParser = new MessagesParser(messagesFilePath, names, (count) => {
            updatesCallback({
                type: 'messageCount',
                count: count
            });
        });
        messagesParser.parse((messages) => {
            this._trainChatbot(messages, completionCallback);
        })
    }

    // Check if the bot was already trained
    isAlreadyTrained() {
        return this.brain.isAlreadyTrained();
    }

    // Use the list of Message objects to train the chatbot
    _trainChatbot(messages, callback) {
        for (const message of messages) {
            this.brain.train(message);
        }
        this.brain.save();
        callback();
    }
}

module.exports = Narcissus;
