const logger = require("../../utils/logger")
const Discord = require('discord.js')
const { description, execute } = require("./ping")
module.exports = {
    name: 'newtable',
    description: 'make a new table',
    execute(message, args) {
        console.log(message, args)
    }
}