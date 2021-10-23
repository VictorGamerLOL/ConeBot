const logger = require("../../utils/logger")
const db = require ("../../utils/mysqlinit")
module.exports = {
    name: 'newcurrency',
    description: 'allows the user to create a new currency for their respective guild',
    async execute (message, args) {
        logger.info(`${message.guildId} is making a new currency named ${args[0]}`)
        const [cur] = await db.query(`ALTER TABLE ${message.guild.id}users ADD ${args[0]} bigint(255)`)
        const [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies (name) VALUES (?);`, [args[0]])
        console.log(cur)
        console.log(cur2)
        message.channel.send(`Successfully created new currency named ${args[0]}`)
    }
}