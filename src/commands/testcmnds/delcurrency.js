const logger = require("../../utils/logger")
const db = require ("../../utils/mysqlinit")
module.exports = {
    name: 'delcurrency',
    description: 'Allows the user to delete a currency from their guild.',
    async execute (message, args) {
        try {logger.info(`${message.guild.id} is deleting their currency named ${args[0]}`)
        const [delcur] = await db.query (`ALTER TABLE ${message.guild.id}users DROP ${args[0]}`)
        const [delcur2] = await db.query(`DELETE FROM ${message.guild.id}currencies WHERE name='${args[0]}'`)
        console.log(delcur)
        console.log(delcur2)
        message.channel.send(`Successfully deleted the currency ${args[0]}`)
    } catch {
        message.channel.send(`An error has occured. Currency does not exist or it has been mistyped.`)
        logger.error(`An error has occured in guild ${message.guild.id} when deleting a currency.`)
    }
    }
}