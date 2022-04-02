const Discord = require('discord.js');
const logger = require('../../utils/logger');
const db = require('../../utils/mysqlinit')
module.exports = {
    name: 'balance',
    aliases: ['bal'],
    description: 'Check your balance overall or for a specific currency',
    async execute(message, args) {
        if (args.length == 1) {
            let [cur] = await db.query(`SELECT * FROM ${message.guild.id}users WHERE id = ${message.author.id}`)
            if (cur[0][args[0]] == undefined) {
                message.channel.send(`The currency ${args[0]} does not exist in this server or it was typed incorrectly. \nPlease note that currency names are case sensitive.`)
            } else {
                message.channel.send(`You have ${cur[0][args[0]]} ${args[0]}`)
            }
        } else if (args.length == 0) {
            let [cur] = await db.query(`SELECT * FROM ${message.guild.id}users WHERE id = ${message.author.id}`)
            let [curlist] = await db.query(`SELECT * FROM ${message.guild.id}currencies`)
            let embed = new Discord.MessageEmbed()
                .setColor('85bb65')
                .setTitle('Your balance')
                .setAuthor('Cone', message.client.user.avatarURL({}))
                .setDescription('Here is how much you have of each currency:')
                .setTimestamp()
                .setFooter('ConeBot™')
            for (let x in cur[0]) {
                if (x == "id") continue
                let [curlist] = await db.query(`SELECT * FROM ${message.guild.id}currencies WHERE name="${x}"`)
                embed.addField(`${curlist[0]["symbol"]} ${x}`, cur[0][x], false)
            }
            message.channel.send(embed)
        }
        }
}