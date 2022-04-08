const logger = require("../../utils/logger")
const sql = require("../../utils/SQLhandler")
module.exports = {
    name: 'delcurrency',
    aliases: ['delcur', 'dc'],
    description: 'Allows the user to delete a currency from their guild.',
    async execute (message, args) {
        //Replace _ with space
        args[0] = args[0].replace(/_/g, " ")
        sql.delCur(message.guild.id, args[0])
        message.channel.send(`Successfully deleted currency named ${args[0]}`)
        logger.info(`${message.guild.id} has deleted currency named ${args[0]}`)
    }
}