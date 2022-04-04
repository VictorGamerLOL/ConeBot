const logger = require('../utils/logger')
const db = require ("../utils/mysqlinit")
const sql = require("../utils/SQLhandler")
module.exports = {
    name: 'guildCreate',
    once: false,
    async execute (guild) {
        logger.info("Joined the guild named", guild.name)
        logger.info("With the ID of", guild.id)
        logger.info("Making new tables...")
        try {
            sql.guildInit(guild.id)
        } catch (error){
            logger.error(error)
            logger.error('The tables probably already exist')
        }
        logger.info("Successfully created tables")
    }
}