

const fs = require('fs');
const Discord = require('discord.js');
const path = require('path');
const {prefix, token} = require('../secrets.json');
const logger = require("./utils/logger")


const client = new Discord.Client({intents: Discord.Intents.ALL,partials: ['MESSAGE', 'CHANNEL', 'REACTION']}); //Init Discord Client Instance

const commandFolders = fs.readdirSync(path.join(__dirname, './commands')); //Get folder of commands and sync with fs


logger.info("Registering Commands...")

for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(path.join(__dirname, `./commands/${folder}`)).filter(file => file.endsWith('.js')); //check folders in the folders (categorise) and read all he ones that end with js
	for (const file of commandFiles) {
		const command = require((path.join(__dirname, `./commands/${folder}/${file}`))); //import the command into bot.js from those files
		client.commands.set(command.name, command);
		logger.info("Registering commands:", command.name)
	}
}
logger.info("Registered Commands")

const eventFiles = fs.readdirSync(path.join(__dirname, './events')).filter(file => file.endsWith('.js')); // same with commands but event handling

logger.info("Registering Events...")

for (const file of eventFiles) {
	const event = require(path.join(__dirname, `./events/${file}`)); // import js file no categories
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
		logger.info("Registered Event:", event.name)
	} else {
		client.on(event.name, (...args) => event.execute(...args, client));
		logger.info("Registered Event:", event.name)
	}
}

logger.info("Registered Events")


client.on('message', async function (message){
    if (!message.content.startsWith(prefix) || message.author.bot) return; //check if its not a bot and starts witht he prefix


	const args = message.content.slice(prefix.length).trim().split(/ +/); //gets the arguments provided from the command
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName) 
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName)); //gets command from our required commands

	if (!command) return; //if the command is not found return

	try {
		command.execute(message, args); // if it is found execute the command
	} catch (error) {
		logger.error(error)
		message.channel.send('there was an error trying to execute that command!'); //error
	}
});

logger.info("Logging in..")
client.login(token);

