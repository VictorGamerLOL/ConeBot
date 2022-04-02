const logger = require('../../utils/logger');
const db = require('../../utils/mysqlinit')
module.exports = {
    name: 'bal',
    description: 'Check your balance for a specific currency',
    execute(message, args) {
        if (args.length == 1) {
            let [cur] = db.query(`SELECT * FROM ${message.guild.id}users WHERE userid = ${message.author.id}`)
            if (cur.length == 0) {
                message.channel.send(`You do not have any ${args[0]}`)
            } else {
                message.channel.send(`You have ${cur[0][args[0]]} ${args[0]}`)
            }
        } else {
            message.channel.send(`You must provide a currency name`)
        }
    }
}