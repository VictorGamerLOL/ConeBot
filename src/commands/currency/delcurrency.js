const logger = require("../../utils/logger")
const sql = require("../../utils/SQLhandler")
module.exports = {
    name: 'delcurrency',
    aliases: ['delcur', 'dc'],
    description: 'Allows the user to delete a currency from their guild.',
    async execute (message, args) {
        sql.delCur(message.guild.id, args[0])
        message.channel.send(`Successfully deleted currency named ${args[0]}`)
        logger.info(`${message.guild.id} has deleted currency named ${args[0]}`)
    }
}