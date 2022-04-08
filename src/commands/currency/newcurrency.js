const logger = require("../../utils/logger")
const sql = require("../../utils/SQLhandler")
module.exports = {
    name: 'newcurrency',
    aliases: ['newcur', 'nc'],
    description: 'Allows the user to create a new currency for their guild', 
    async execute(message, args) {
        args[0] = args[0].replace(/_/g, " ")
        if (args.length == 5) { 
            logger.info(`${message.guild.id} is making a new currency named ${args[0]}`)
            if (args[2] == "t" && !isNaN(args[3]) && !isNaN(args[4])) {
                sql.addCur(message.guild.id, args[0], args[1], 1, args[3], args[4])
                message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`) 
                logger.info(`${message.guild.id} has created a new currency named ${args[0]} with the symbol of ${args[1]}`)
            } else if (args[2] == "f" && !isNaN(args[3]) && !isNaN(args[4])) { 
                message.channel.send('I do not know why you said you dont want the currency to be earnable and then proceeded to provide cooldown and amount but WhAtEvEr') 
                sql.addCur(message.guild.id, args[0], args[1], 0, args[3], args[4])
                message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`)
                logger.info(`${message.guild.id} has created a new currency named ${args[0]} with the symbol of ${args[1]}`)
            } else if (args[2] != "t" && args[2] != "f") {
                message.channel.send(`Value of earnable must be either "t" or "f".`)
                logger.error(`${message.guild.id} tried to create a new currency named ${args[0]} with the symbol of ${args[1]} but the earnable value was not "t" or "f"`)
            } else if (isNaN(args[3]) && isNaN(args[4])) {
                message.channel.send(`Value of cooldown and rate must be numbers.`)
                logger.error(`${message.guild.id} tried to create a new currency named ${args[0]} with the symbol of ${args[1]} but the cooldown and rate were not numbers`)
            } 
        } else if (args.length == 4) {
            message.channel.send(`Please provide rate along with cooldown of earning.`)
            logger.error(`${message.guild.id} has attempted to create a new currency named ${args[0]} with the symbol of ${args[1]} but did not provide rate along with cooldown`)
        } else if (args.length == 3) {
            if (args[2] == "f") { 
                sql.addCur(message.guild.id, args[0], args[1], 0, null, null) 
                message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}.`)
                logger.info(`${message.guild.id} has created a new currency named ${args[0]} with the symbol of ${args[1]}`)
            } else {
                message.channel.send(`Please provide cooldown and rate if you said true about earning.`)
                logger.error(`${message.guild.id} has attempted to create a new currency named ${args[0]} with the symbol of ${args[1]} but did not provide cooldown and rate when they said true earning.`)
            }
        } else if (args.length == 2) { 
            sql.addCur(message.guild.id, args[0], args[1], 0, null, null)
            message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}.`)
            logger.info(`${message.guild.id} has created a new currency named ${args[0]} with the symbol of ${args[1]}`)
        } else if (args.length == 1) {
            message.channel.send(`Currency symbol is mandatory.`)
            logger.error(`${message.guild.id} has attempted to create a new currency named ${args[0]} but did not provide a symbol`)
        } else {
            message.channel.send(`I do not know what you wanted to do but I do not take this many arguments.`)
            logger.error(`${message.guild.id} has attempted to create a new currency but did not provide enough arguments`)
        }
    }
}