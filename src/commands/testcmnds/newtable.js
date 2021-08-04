const logger = require("../../utils/logger")
const Discord = require('discord.js')
const { description, execute } = require("./ping")
const db = require ("../../utils/mysqlinit")
module.exports = {
    name: 'newtable',
    description: 'make a new table',
    async execute(message, args) {
        const [res] = await db.query(`UPDATE cones SET ActualImage = ${bytes.parse("../../../trial images/cone (1)")}`)
        console.log(res) 
        } 
}