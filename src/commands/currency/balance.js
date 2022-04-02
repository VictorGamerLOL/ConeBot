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
            console.log(cur)
            logger.info(cur)
            if (cur.length == 0) {
                message.channel.send(`You do not have any ${args[0]}`)
            } else {
                message.channel.send(`You have ${cur[0][args[0]]} ${args[0]}`)
            }
        } else if (args.length == 0) {
            let [cur] = await db.query(`SELECT * FROM ${message.guild.id}users WHERE id = ${message.author.id}`)
            let embed = new Discord.MessageEmbed()
                .setColor('85bb65')
                .setTitle('Your balance')
                .setAuthor('Cone', message.client.user.avatarURL({}))
                .setDescription('Here is how much you have of each currency:')
                .setTimestamp()
                .setFooter('ConeBot™')
            for (let x in cur[0]) {
                if (x == "id") continue
                embed.addField(x, cur[0][x], false)
            }
            message.channel.send(embed)
        }
        }
}