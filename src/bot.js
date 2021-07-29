const fs = require('fs');
const Discord = require('discord.js');
const path = require('path');
const {prefix, token} = require('../secrets.json');
const logger = require("./utils/logger")


const client = new Discord.Client({intents: Discord.Intents.ALL,partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync(path.join(__dirname, './commands'));


logger.info("Registering Commands...")
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(path.join(__dirname, `./commands/${folder}`)).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const command = require((path.join(__dirname, `./commands/${folder}/${file}`)));
		client.commands.set(command.name, command);
		logger.info("Registering commands:", command.name)
	}
}
logger.info("Registered Commands")

const eventFiles = fs.readdirSync(path.join(__dirname, './events')).filter(file => file.endsWith('.js'));

logger.info("Registering Events...")

for (const file of eventFiles) {
	const event = require(path.join(__dirname, `./events/${file}`));
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
		logger.info("Registered Event:", event.name)
	}
}

logger.info("Registered Events")


client.on('message', async function (message){
    if (!message.content.startsWith(prefix) || message.author.bot) return;


	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type === 'dm') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.permissions) {
		const authorPerms = message.channel.permissionsFor(message.author);
		if (!authorPerms || !authorPerms.has(command.permissions)) {
			return message.reply('You can not do this!');
		}
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	const { cooldowns } = client;

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		logger.error(error)
		message.channel.send('there was an error trying to execute that command!');
	}
});

logger.info("Logging in..")
client.login(token);