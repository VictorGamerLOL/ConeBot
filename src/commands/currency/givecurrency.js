const sql = require('../../utils/SQLhandler')
const logger = require('../../utils/logger')
const {prefix} = require(`../../../secretss.json`)
module.exports = {
    name: 'givecurrency',
    aliases: ['givecur', 'gc'],
    description: 'Give or take a certain amount of a specific currency from a user ',
    async execute(message, args) {
        args[1] = args[1].replace(/_/g, " ")
        if (args.length != 3) { //Message requires fixed amount of arguments so check early one if it is exactly that
            message.channel.send(`Invalid amount of arguments provided.\nUsage: \`${prefix}givecurrency <user> <currency> <amount>\``)
            return
        }
        let resMessage = function(results) { //Function for making message when multiple users were affected
            let message = (``)
            if (results[0] != 0) {
                message += `Added ${args[2]} ${args[1]} to ${results[0]} users.\n`
            }
            if (results[1] != 0) {
                message += `Set the balance of ${args[1]} to the maximum balance for ${results[1]} users.\n`
            }
            if (results[2] != 0) {
                message += `Set the balance of ${args[1]} to the minimum balance for ${results[2]} users.\n`
            }
            if (message == "" || message == undefined) {
                message = "How strange nothing happened"
            }
            return message
        }
        rolePattern = new RegExp(message.mentions.ROLES_PATTERN)
        userPattern = new RegExp(message.mentions.USERS_PATTERN)
        everyonePattern = new RegExp(message.mentions.EVERYONE_PATTERN)
        if (isNaN(args[2])) {
            if (args[2] == "inf") { //Convert inf to max safe integer to make it easier on the user's side
                args[2] = Number.MAX_SAFE_INTEGER
            } else if (args[2] == "-inf") { //Convert -inf to min safe integer to make it easier on the user's side
                args[2] = Number.MIN_SAFE_INTEGER
            } else {
                message.channel.send('You must provide a number or "inf"')
                return
            }
        }
        if (args[0].startsWith('<@&')) { //Check if the first argument is a role mention
            if (Array.from(message.mentions.roles.values()).length>1) {
                    message.channel.send('You can only mention one role at a time.')
                    return
                }
                let membIDs= []
                Array.from(message.mentions.roles.first().members.values()).forEach(async function(value) {
                    if (value.user.bot) return
                    membIDs.push(value.id)
                })
                try {
                    var results = await sql.addToMultiple(message.guild.id, args[1], "users", parseInt(args[2]), "id", membIDs)
                } catch {
                    message.channel.send('That currency does not exist or it has been mistyped.')
                    return
                }
                
                message.channel.send(`${resMessage(results)}`)
        } else if (args[0].startsWith('<@')) { //Check if the first argument is a user mention
            if (Array.from(message.mentions.users.values()).length>1) {
                    message.channel.send('You can only mention one user at a time.')
                    return
            }
            try {
                var results = await sql.addToSingle(message.guild.id, args[1], "users", parseInt(args[2]), "id", message.mentions.users.first().id)
            } catch {
                message.channel.send('That currency does not exist or it has been mistyped.')
                return
            }
            
            if (results == Number.MAX_SAFE_INTEGER) {
                message.channel.send(`${args[0]}'s balance of ${args[1]} has been set to the maximum balance of ${Number.MAX_SAFE_INTEGER}.`)
            } else if (results == Number.MIN_SAFE_INTEGER) {
                message.channel.send(`${args[0]}'s balance of ${args[1]} has been set to the minimum balance of ${Number.MIN_SAFE_INTEGER}.`)
            } else {
                message.channel.send(`${args[2]} ${args[1]} has been added to ${args[0]}'s balance and they now have ${results} ${args[1]}.`)
            }
        } else if (args[0] == '@everyone') { //Check if the first argument is @everyone
            let memCollect = await message.guild.members.fetch()
            let memArray = Array.from(memCollect.values())
            let idsArray=[]
            memArray.forEach(async function (value) {
                if (value.user.bot) return
                idsArray.push(value.id)
            })
            try{
                results = await sql.addToMultiple(message.guild.id, args[1], "users", parseInt(args[2]), "id", idsArray)
                message.channel.send(resMessage(results))
            } catch {
                message.channel.send("That currency does not exist or it has been mistyped.")
            }
        } else {
            message.channel.send('You must provide a valid user or role mention (@everyоne is valid).') //You may notice a weird unicode character here. It's there to stop the @everyone mention.
        }
    }
}
