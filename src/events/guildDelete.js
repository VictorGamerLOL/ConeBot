const logger = require('../utils/logger')
const db = require ("../utils/mysqlinit")
module.exports = {
    name: 'guildDelete',
    once: false,
    async execute (guild) {
        logger.info("Left the guild named", guild.name)
        logger.info("With the ID of", guild.id)
        logger.info("Deleting tables...")
        const[curTable] = await db.query(`DROP TABLE ${guild.id}currencies`)
        const[usrTable] = await db.query(`DROP TABLE ${guild.id}users`)
        console.log(curTable)
        console.log(usrTable)
        logger.info("Successfully deleted tables")
    }
}