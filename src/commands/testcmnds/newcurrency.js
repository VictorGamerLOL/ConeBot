const logger = require("../../utils/logger")
const db = require ("../../utils/mysqlinit")
module.exports = {
    name: 'newcurrency',
    description: 'Allows the user to create a new currency for their guild',
    async execute (message, args) {
        if (args.length == 2) {
            try {logger.info(`${message.guild.id} is making a new currency named ${args[0]}`)
            const [cur] = await db.query(`ALTER TABLE ${message.guild.id}users ADD ${args[0]} bigint(255)`)
            const [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}')`)
            console.log(cur)
            console.log(cur2)
            message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`)
        } catch { 
            message.channel.send(`An error has occured. Currency most likely already exists.`)
            logger.error(`An error has occured in guild ${message.guild.id} when making a new currency`)
        }
        } else {
            message.channel.send('Incorrect amount of arguments.')
        }
    }
}