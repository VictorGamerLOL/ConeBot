const logger = require("../../utils/logger")
const Discord = require('discord.js')
module.exports = {
	name: 'ping',
	description: 'Ping!',
	execute(message, args) {
		const pingembed = new Discord.MessageEmbed()
			.setColor('#00ff00')
			.setTitle('🏓 Pong!')
			.setAuthor('Cone', message.client.user.avatarURL({}))
			.setDescription(`${Date.now() - message.createdTimestamp}ms`)
			.addField(
				'Current server time (BST)',
				new Date().toISOString().replace(/T/, ' ').replace('Z', ''),
				false
			)
			.setTimestamp()
			.setFooter('ConeBot™')
		message.channel.send(`🏓 Pong! ${Date.now() - message.createdTimestamp}ms`, [pingembed]);
	},
};