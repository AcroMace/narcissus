from flask import Flask
from narcissus import Narcissus
import json

app = Flask(__name__)
narcissus = Narcissus()
config = json.loads(open('config.json').read())

@app.route('/chat/<string:query>')
def get_response(query):
    return narcissus.get_response(query)

@app.route('/train')
def train():
    # User ID of the authorized user
    facebook_id = config['facebook_id']
    # OAuth token of the authorized user
    facebook_token = config['facebook_token']
    # OAuth with Facebook and train the bot
    narcissus.train_with_facebook(facebook_id, facebook_token)
    return 'Training successful'

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)
