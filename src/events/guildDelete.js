const logger = require('../utils/logger')
const db = require ("../utils/mysqlinit")
const sql = require("../utils/SQLhandler")  
module.exports = {
    name: 'guildDelete',
    once: false,
    async execute (guild) {
        logger.info("Left the guild named", guild.name)
        logger.info("With the ID of", guild.id)
        logger.info("Deleting tables...")
        try {
            sql.guildDel(guild.id)
        } catch {
            logger.error(`Failed to delete tables of ${guild.id}. They probably don't exist.`)
            return
        }
        
        logger.info("Successfully deleted tables")
    }
}