/*
 * Files may contain an overly large amount of comments because I do not trust myself to remember everything that my code does,
 * so instead I will just place comments on everything I would most likely forget. If you do not like that then you can cry
 * about it.
 */
import path from "path"; //Walmart CommonJS imports (thanks ECMAScript, very cool /s)
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import logger from "./utils/logger";
import sql from "./utils/db-handler";
import {
  ActivityType,
  ApplicationCommandOptionType,
  Client,
  Collection,
  GatewayIntentBits,
  IntentsBitField,
  Partials,
  PresenceData,
  REST,
  RESTPostAPIApplicationCommandsJSONBody,
  Routes,
} from "discord.js";
import db from "./utils/bot-db";
const RESTapi = new REST({ version: "10" });
const TOKEN = process.env.TOKEN;
let defaultPrefix = process.env.PREFIX;
const CLIENTID = process.env.CLIENTID;

if (TOKEN === undefined) {
  throw new Error("No token provided in environment variables or .env file");
}
if (CLIENTID === undefined) {
  throw new Error(
    "No client ID provided in environment variables or .env file"
  );
}
if (!defaultPrefix) {
  defaultPrefix = "cn!";
}

RESTapi.setToken(TOKEN);

const intents: GatewayIntentBits[] = [
  IntentsBitField.Flags.GuildMessages,
  IntentsBitField.Flags.GuildMembers,
  IntentsBitField.Flags.Guilds,
  IntentsBitField.Flags.GuildBans,
  IntentsBitField.Flags.GuildInvites,
  IntentsBitField.Flags.GuildMessageReactions,
]; //Here we tell discord what data we want from it.

const partials: Partials[] = [
  Partials.GuildMember,
  Partials.Reaction,
  Partials.Message,
  Partials.User,
  Partials.Channel,
  Partials.ThreadMember,
  Partials.GuildScheduledEvent,
]; //Can't be bothered to run into missing events because they do not have all the data, so we make everything partial :)

const presenceData: PresenceData = {
  status: "online",
  activities: [
    {
      name: "your money", //Basically the presence the bot will have.
      type: ActivityType.Watching,
    },
  ],
};

const client = new Client({
  intents: intents,
  partials: partials,
  presence: presenceData,
});

let commands: Collection<string, command["default"]> = new Collection(); //Embed the commands directly in the client object

const initCommands: () => Promise<void> = async () => {
  logger.info("COMMANDS: initializing commands");
  //Load all commands amd make a REST request for them.
  const commandFolders = fs.readdirSync(path.join(__dirname, "./commands")); //__dirname represents the directory in which this file is in, so we do not need to specify "./scr/commands"
  const slashCommands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  for (const folder of commandFolders) {
    const commandFiles = fs
      .readdirSync(path.join(__dirname, `./commands/${folder}`))
      .filter((file) => file.endsWith(".ts")); //Only take the .ts files
    for (const file of commandFiles) {
      const { default: command }: command = await import(
        `./commands/${folder}/${file}`
      ); //Import the file
      commands.set(command.name, command); //Add the command to the collection
      slashCommands.push(command.slashBuilder()); //Add the command to the slashCommands array
      logger.info("COMMANDS: Registered command ", command.name);
    }
  }
  try {
    logger.info(
      `COMMANDS: Started reloading ${slashCommands.length} slash commands.`
    );
    const data: any = await RESTapi.put(Routes.applicationCommands(CLIENTID), {
      body: slashCommands,
    });
    logger.info(
      `COMMANDS: Successfully reloaded ${data.length} slash commands.`
    );
  } catch (error) {
    console.error(error);
  }
};

const initListeners: () => Promise<void> = async () => {
  //We load all of the listeners here, including the one for slash commands and events (to be made later).
  logger.info("LISTENERS: Starting listening for commands...");
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.isChatInputCommand()) return; //Remove this when adding context menu commands.
    const command = commands.get(interaction.commandName);
    if (!command) return;
    let argsArr = interaction.options.data;
    let args: any = new Object();
    for (let x of argsArr) {
      if (
        x.type === ApplicationCommandOptionType.String ||
        x.type === ApplicationCommandOptionType.Integer ||
        x.type === ApplicationCommandOptionType.Boolean
      ) {
        args[x.name] = x.value;
      } else if (x.type === ApplicationCommandOptionType.User) {
        args[x.name] = x.user;
      } else if (x.type === ApplicationCommandOptionType.Channel) {
        args[x.name] = x.channel;
      } else if (x.type === ApplicationCommandOptionType.Role) {
        args[x.name] = x.role;
      } else if (x.type === ApplicationCommandOptionType.Attachment) {
        args[x.name] = x.attachment;
      } else {
        args[x.name] = x.value;
      }
    }
    try {
      if (command.name === "help") {
        await interaction.deferReply({ ephemeral: true });
        await command.execute(args, interaction, commands);
        logger.info(
          `${interaction.user.id} executed the command:`,
          `${command.name}`
        );
      } else {
        await interaction.deferReply({ ephemeral: true });
        await command.execute(args, interaction);
        logger.info(
          `${interaction.user.id} executed the command:`,
          `${command.name}`
        );
      }
    } catch (error) {
      logger.error("LISTENERS:" + error);
      await interaction.editReply({
        content:
          "There was an error while executing this command! Please try again later.",
      });
    }
  });
  logger.info("LISTENERS: Listening for commands...");
};

client.login(TOKEN);
initCommands();
initListeners();
client.once("ready", async () => {
  logger.info("CLIENT: Ready!");
  sql.init();
});
