const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json');
const { prefix, token } = require('./config.json');

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
  if (msg.content === prefix+'ping') {
    msg.reply('pong');
  }
});

client.login(token);