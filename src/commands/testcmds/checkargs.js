const logger = require ('../../utils/logger');
const db = require ('../../utils/mysqlinit')
module.exports = {
    name: 'checkargs',
    aliases: ['ca'],
    description: 'Check how arguments will be passed on (TESTING COMMAND)',
    execute(message, args) {
        message.channel.send(`Arguments: ${args}`)
        logger.info(`${args}`)
    }
}