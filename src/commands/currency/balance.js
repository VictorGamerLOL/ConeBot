const Discord = require('discord.js');
const logger = require('../../utils/logger');
const db = require('../../utils/mysqlinit');
const sql = require('../../utils/SQLhandler')
module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: 'Check your balance overall or for a specific currency',
    async execute(message, args) {
        if (args.length == 2) {
            if (args[0].startsWith("<@&")) {
                message.channel.send("Not only did you try something I cannot do, you also probably pinged a lot of people. I hope you are happy with this.");
            } else if (args[0] == "@everyone" || args[0] == "@here") {
                message.channel.send("Hey smartass thats not how you get the leaderboard. You are just being annoying.")
            } else if (args[0].startsWith("<@")) {
                try {
                    let [cur] = await sql.selectWhere("*", message.guild.id, "users", "id", args[0].slice(2, -1))
                    if (cur.length == 0) {
                        message.channel.send("User not found")
                    } else {
                        if (cur[0][args[1]] === undefined) {
                            message.channel.send("That currency does not exist or it has been mistyped. \nKeep in mind that currency names are case sensitive.")
                        } else {
                            message.channel.send(`${message.mentions.users.first().username} has ${cur[0][args[1]]} ${args[1]}`)
                        }
                    }
                } catch {
                    message.channel.send("That currency does not exist or it has been mistyped \nKeep in mind that currency names are case sensitive")
                }
            } else {
                message.channel.send("You need to ping a user or use the command like this: `!balance @user <currency>`")
            }
        }else if (args.length == 1) { 
            if (args[0].startsWith("<@&")) {
                message.channel.send("Not only did you try something I cannot do, you also probably pinged a lot of people. I hope you are happy with this.");
            } else if (args[0] == "@everyone" || args[0] == "@here") {
                message.channel.send("Hey smartass thats not how you get the leaderboard. You are just being annoying.")
            } else if (args[0].startsWith("<@")) {
                let [cur] = await sql.selectWhere("*", message.guild.id, "users", "id", args[0].slice(2, -1))
                if (cur.length == 0) {
                    message.channel.send("User not found")
                } else {
                    let embed = new Discord.MessageEmbed()
                        .setColor('85bb65')
                        .setTitle(`${message.mentions.users.first().username}'s balance`)
                        .setAuthor('Cone', message.client.user.avatarURL({}))
                        .setDescription('Here is how much they have of each currency:')
                        .setTimestamp()
                        .setFooter('ConeBot™')
                    let i=0
                    for (let x in cur[0]) {
                        if (x == "id") continue
                        let [curlist] = await sql.selectAll("*", message.guild.id, "currencies")
                        embed.addField(`${curlist[i]["symbol"]} ${x}`, cur[0][x], false)
                        i++
                    }
                    message.channel.send(embed)
                }   
            } else {
                try {
                    let [cur] = await sql.selectWhere(args[0], message.guild.id, "users", "id", message.author.id)
                    message.channel.send(`You have ${cur[0][args[0]]} ${args[0]}`)
                } catch {
                    message.channel.send("That currency does not exist or it has been mistyped \nKeep in mind that currency names are case sensitive")
                }
            }
        } else if (args.length == 0) {
            let [cur] = await sql.selectWhere("*", message.guild.id, "users", "id", message.author.id)
            let embed = new Discord.MessageEmbed()
                .setColor('85bb65')
                .setTitle('Your balance')
                .setAuthor('Cone', message.client.user.avatarURL({}))
                .setDescription('Here is how much you have of each currency:')
                .setTimestamp()
                .setFooter('ConeBot™')
            let i=0
            for (let x in cur[0]) {
                if (x == "id") continue
                let [curlist] = await sql.selectAll("symbol", message.guild.id, "currencies")
                embed.addField(`${curlist[i]["symbol"]} ${x}`, cur[0][x], false)
                i++
            }
            message.channel.send(embed)
        } else {
            message.channel.send("Invalid amount of arguments entered.")
        }
        }
}