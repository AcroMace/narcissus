'use strict';

const fs = require('fs');
const rp = require('request-promise');
const BotBrain = require('./botbrain.js');
const Message = require('./message.js');


class Narcissus {

    constructor() {
        this.brain = new BotBrain();
    }

    // Get the response to a user message
    getReply(message) {
        return this.brain.getReply(message);
    }

    // Train the bot with Facebook data
    trainWithFacebookMessages(facebookID, facebookToken) {
        // Retrieve the JSON for the chat adata
        let self = this;
        this._getChatData(function (facebookResponse) {
            let parsedMessages = self._parseFacebookResponse(facebookID, facebookResponse);
            self._trainChatbot(parsedMessages);
        });
    }

    // Request chat data from Facebook
    _getChatData(facebookToken, callback) {
        // We need to use v2.3 of the Facebook API as reading the user's inbox has been
        // deprecated since v2.4
        rp.get({
            url: 'https://graph.facebook.com/v2.3/me/inbox',
            qs: { access_token: facebookToken }
        })
            .then(function (data) {
                // There's a lot of pagination that needs to be done here
                // We need to paginate through the list of conversations, as well as the list of messages
                // in each conversation
                // For now, just return the first large JSON given
                console.log(data);
                callback(JSON.parse(data));
            })
            .error(function (err) {
                console.error(err);
            });
    }

    // Get example JSON data for testing purposes
    _getExampleChatData(callback) {
        fs.readFile('messages.json', 'utf8', function (err, data) {
            if (err || !data) {
                console.error('Could not find messages.json');
                return;
            }
            callback(JSON.parse(data));
        });
    }

    // Parse the JSON returned from Facebook
    _parseFacebookResponse(facebookID, facebookResponse) {
        // Get the next page of conversations
        const nextPage = facebookResponse.paging.next;
        // This will probably not work once we start paging since that will kill the RAM
        return facebookResponse['data']
            .map(conversation => this._parseConversation(facebookID, conversation)) // Returns an array of Messages
            .reduce((a, b) => a.concat(b)); // Flatten
    }

    // Parse a conversation object and return an array of messages
    //   facebookID: Facebook user ID of the logged in user
    //   conversation: The conversation object returned from Facebook
    _parseConversation(facebookID, conversation) {
        let messages = [];
        if (!conversation.comments) { return []; }

        // We can use this to get more messages from the same conversation (currently unused)
        // Ensure that we check this at the end of the function and reutrn if no longer available
        // We can stop paging when the nextPage variable is undefined
        const nextPage = conversation.comments.paging.next;

        // Save the last message so we know if the text is a reply
        let lastMessageContent = '';
        let lastMessageSender = facebookID;

        // Iterate through the messages and add them to the messages array if the last message
        // was from the other person and this message is from yourself
        for (const message of conversation.comments.data) {
            // The message field is empty if a picture or a sticker was sent
            if (!message.message) { continue; }

            // The current message
            const messageContent = message.message;
            const messageSender = message.from.id;

            // Add the message to the messages if the conditions match
            if (lastMessageSender !== facebookID && messageSender === facebookID) {
                messages.push(new Message(message.id, lastMessageContent, messageContent));
            }

            // Update the last message sent to the current one
            lastMessageContent = messageContent;
            lastMessageSender = messageSender;
        }

        return messages;
    }

    // Use the list of Message objects to train the chatbot
    _trainChatbot(messages) {
        for (const message of messages) {
            this.brain.train(message);
        }
        this.brain.save();
    }
}
