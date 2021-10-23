const logger = require('../utils/logger')
const db = require ("../utils/mysqlinit")
module.exports = {
    name: 'guildCreate',
    once: false,
    async execute (guild) {
        logger.info("Joined the guild named", guild.name)
        logger.info("With the ID of", guild.id)
        logger.info("Making new tables...")
        try {
            const[curTable] = await db.query(`CREATE TABLE ${guild.id}currencies (name varchar(255), symbol varchar(255))`)
            const[usrTable] = await db.query(`CREATE TABLE ${guild.id}users (id bigint(255))`)
            console.log(curTable)
            console.log(usrTable)
        } catch (error){
            logger.error(error)
            logger.error('The tables probably already exist')
        }
        logger.info("Successfully created tables")
    }
}