const logger = require('../../utils/logger');
const db = require('../../utils/mysqlinit');
module.exports = {
    name: 'sqlect',
    aliases: ['sql'],
    description: 'Execute an SQL query',
    async execute(message, args) {
        if (args.length == 0) {
            message.channel.send(`You must provide a query`)
        } else {
            let [res] = await db.query(args.join(' '))
            console.log(res)
            logger.info(res)
            if (res.length == 0) {
                message.channel.send(`No results found`)
            } else {
                message.channel.send(`Results: ${JSON.stringify(res)}`)
            }
        }
    }
}