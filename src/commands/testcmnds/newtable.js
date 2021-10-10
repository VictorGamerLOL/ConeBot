const logger = require("../../utils/logger")
const Discord = require('discord.js')
const { description, execute } = require("./ping")
const db = require ("../../utils/mysqlinit")
module.exports = {
    name: 'newtable',
    description: 'make a new table',
    async execute(message, args) {
        const tablename = args[0]
        const [res] = await db.query(`CREATE TABLE ${tablename} (name varchar(255))`)
        console.log(res) 
        } 
}