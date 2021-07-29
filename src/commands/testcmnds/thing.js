const logger = require("../../utils/logger")
module.exports = {
    name: 'thing',
    description: 'What is that?',
    execute(message,args) {
        message.channel.send('something');
    }
}