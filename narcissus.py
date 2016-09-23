from chatterbot import ChatBot
import requests
import yaml

# Request chat data from Facebook
def get_chat_data(facebook_token):
    # We need to use v2.3 of the Facebook API as reading the user's inbox has been
    # deprecated since v2.4
    base_url = 'https://graph.facebook.com/v2.3/me/inbox'
    params = { 'access_token': facebook_token }
    r = requests.get(base_url, params=params)
    return r.json()

if __name__ == "__main__":
    # Get the Facebook OAuth token
    config = yaml.load(file('narcissus.conf', 'r'))
    facebook_token = config['FACEBOOK_TOKEN']

    # Retrieve the JSON for the chat data
    print(get_chat_data(facebook_token))
