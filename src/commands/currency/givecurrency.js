const sql = require('../../utils/SQLhandler')
const logger = require('../../utils/logger')
module.exports = {
    name: 'givecurrency',
    aliases: ['givecur', 'gc'],
    description: 'Give a user a certain amount of a specific currency',
    async execute(message, args) {
        rolePattern = new RegExp(message.mentions.ROLES_PATTERN)
        console.log(args)
        if (args.length == 3) {
            if (rolePattern.test(args[0])) {
                if (Array.from(message.mentions.roles.values()).length>1) {
                    message.channel.send('You can only mention one role at a time.')
                    return
                }
                if (isNaN(args[2])) {
                    if (args[2] == "inf") {
                        args[2] = Number.MAX_SAFE_INTEGER
                    } else {
                        message.channel.send('You must provide a number or "inf"')
                        return
                    }
                }
                if (args[2] > Number.MAX_SAFE_INTEGER) {
                    message.channel.send('You must provide a number less than ' + Number.MAX_SAFE_INTEGER + ' as that is what "inf" is.')
                    return
                }
                let membIDs= []
                Array.from(message.mentions.roles.first().members.values()).forEach(async function(value) {
                    membIDs.push(value.id)
                })
                sql.updateMultiple(message.guild.id, args[1], "users", args[2], "id", membIDs)
            }
        }
    }
}