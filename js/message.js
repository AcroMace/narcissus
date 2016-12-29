// A representation of a message

class Message {

    constructor(id, prompt, reply) {
        this.id = id;         // Used to index the messages - provided by Facebook
        this.prompt = prompt; // What the other person said
        this.reply = reply;   // How you replied to the other person
    }

}

module.exports = Message;
