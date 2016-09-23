from chatterbot import ChatBot
from chatterbot.trainers import ListTrainer
import requests
import json

class Narcissus:

    def __init__(self):
        self.chatbot = ChatBot('Narcissus', read_only=True)

    def get_response(self, message):
        response = self.chatbot.get_response(message)
        # Weird hack - trying to serialize with str(response) doesn't work although it seems like
        #              it should be doing the same thing from the source code
        return response.serialize()['text']

    # Train the bot with Facebook data
    def train_with_facebook(self, facebook_id, facebook_token):
        # Enable writing to the bot
        self.chatbot = ChatBot('Narcissus', read_only=False)
        self.chatbot.set_trainer(ListTrainer)

        # Retrieve the JSON for the chat data
        # chat_data = self.get_chat_data(facebook_token)

        # Get the JSON data from a local file
        chat_data = self.get_example_chat_data()
        # Get (other_person, your_reply) tuples
        message_tuples = self.parse_messages_json(facebook_id, chat_data)

        # Train the model
        self.train_chatbot(message_tuples)

        # Set it to read only
        self.chatbot = ChatBot('Narcissus', read_only=True)

    # Request chat data from Facebook
    def get_chat_data(self, facebook_token):
        # We need to use v2.3 of the Facebook API as reading the user's inbox has been
        # deprecated since v2.4
        base_url = 'https://graph.facebook.com/v2.3/me/inbox'
        params = { 'access_token': facebook_token }
        r = requests.get(base_url, params=params)
        # There's a lot of pagination that needs to be done here
        # We need to paginate through the list of conversations, as well as the list of messages
        # in each conversation
        # For now, just return the first large JSON given
        return r.json()

    # Get example JSON data
    def get_example_chat_data(self):
        json_file = open('messages.json').read()
        return json.loads(json_file)

    # Parse a conversation object
    def parse_conversation(self, user_id, conversation):
        message_pairs = []
        if 'comments' not in conversation:
            return message_pairs

        # How we can get to more text from the same conversation (currently unused)
        # Ensure that we check this at the end of the function and return if no longer available
        # next_page = conversation['paging']['next']

        # Save what the last message was
        last_message_content = ""
        last_message_sender = user_id # We don't want this blank message being added to the pairs

        # Iterate through the messages and add them to message_pairs if the last message
        # was from the other person and the current message is yours
        for message in conversation['comments']['data']:
            # Apparently it's possible to send a message with no message in it?
            if 'message' not in message:
                continue
            message_content = message['message']
            message_sender = message['from']['id']
            # Add the tuple if the above conditions match
            if last_message_sender != user_id and message_sender == user_id:
                message_pairs.append((last_message_content.encode('utf-8'), message_content.encode('utf-8')))
            last_message_content = message_content
            last_message_sender = message_sender
        return message_pairs

    # Parse the messages to get a list of (other person's message, your message)
    #   user_id: The logged in user's user ID as a string
    #   messages: The messages JSON response
    def parse_messages_json(self, user_id, messages):
        message_pairs = []
        for conversation in messages['data']:
            message_pairs += self.parse_conversation(user_id, conversation)
        return message_pairs

    # Use the list of message tuples to train the chatbot
    def train_chatbot(self, message_tuples):
        for tuple in message_tuples:
            other_person_message, your_message = tuple
            self.chatbot.train([other_person_message, your_message])
