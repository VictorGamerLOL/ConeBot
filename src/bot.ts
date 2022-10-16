/* 
 * Files may contain an overly large amount of comments because I do not trust myself to remember everything that my code does,
 * so instead I will just place comments on everything I would most likely forget. If you do not like that then you can cry
 * about it.
 */
import { CollectionConstructor } from '@discordjs/collection';
import { PresenceData, RESTGetAPIApplicationCommandsResult, RESTPutAPIApplicationCommandsResult, SlashCommandBuilder } from 'discord.js';
import * as url from 'url';
import path from 'path'; //Walmart CommonJS imports (thanks EMCAScript, very cool /s)
import fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();
import logger from './utils/logger';
import Discord from 'discord.js';
const REST = new Discord.REST({ version: "10" });
const TOKEN = process.env.TOKEN;
let defaultPrefix = process.env.PREFIX;
const CLIENTID = process.env.CLIENTID;

if (!TOKEN) {
  console.log(TOKEN);
  throw new Error("No token provided in environment variables or .env file");
}
if (!CLIENTID) {
  throw new Error("No client ID provided in environment variables or .env file");
}
if (!defaultPrefix) {
  defaultPrefix = "cn!";
}

REST.setToken(TOKEN);

const intents = [
  Discord.IntentsBitField.Flags.GuildMessages,
  Discord.IntentsBitField.Flags.GuildMembers,
  Discord.IntentsBitField.Flags.Guilds,
  Discord.IntentsBitField.Flags.GuildBans,
  Discord.IntentsBitField.Flags.GuildInvites,
  Discord.IntentsBitField.Flags.GuildMessageReactions,
]; //Here we tell discord what data we want from it.

const partials = [
  Discord.Partials.GuildMember,
  Discord.Partials.Reaction,
  Discord.Partials.Message,
  Discord.Partials.User,
  Discord.Partials.Channel,
  Discord.Partials.ThreadMember,
  Discord.Partials.GuildScheduledEvent,
]; //Can't be bothered to run into missing events because they do not have all the data, so we make everything partial :)

const presenceData: PresenceData = {
  status: "online",
  activities: [
    {
      name: "your money", //Basically the presence the bot will have.
      type: Discord.ActivityType.Watching,
    },
  ],
};

const client = new Discord.Client({
  intents: intents,
  partials: partials,
  presence: presenceData,
});

let commands = new Discord.Collection(); //Embed the commands directly in the client object

const initCommands = async () => {
  const commandFolders = fs.readdirSync(
    path.join(__dirname, './commands')); //__dirname represents the directory in which this file is in, so we do not need to specify "./scr/commands"
  const slashCommands: String[] = [];
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, `./commands/${folder}`)).filter(file => file.endsWith('.ts')); //Only take the .js files
    for (const file of commandFiles) {
      const command = await import(`./commands/${folder}/${file}`); //Import the file
      commands.set(command.default.name, command.default); //Add the command to the collection
      slashCommands.push(command.default.slashBuilder()); //Add the command to the slashCommands array
      logger.info("Registered command ", command.default.name);
      try {
        logger.info(`Started reloading ${slashCommands.length} slash commands.`);
        const data: any = await REST.put(
          Discord.Routes.applicationCommands(CLIENTID),
          { body: slashCommands },
        );
        logger.info(`Successfully reloaded ${data.length} slash commands.`);
      } catch (error) {
        console.error(error);
      }
    }
  }
  
};

client.login(TOKEN);

client.on("ready", async () => {
  logger.info("Client logged in, putting commands...");
  await initCommands();
})