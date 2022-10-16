import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Discord from "discord.js";

export default {
  name: "help",
  description:
    "Gives details about every command or an individual command if specified.",
  longDesc: "This command will either: A. give you a list of commands, or B. give you a long description of a specified command by the user. Each help text might not always be the same depending on who is hosting the bot.",
  locked: false,
  defaultConfig() {
    return null;
  },
  slashBuilder() {
    const command = new Discord.SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
      .addStringOption((option) =>
        option
          .setName("command")
          .setDescription("The command to get help for")
          .setRequired(false)
      );
    return command.toJSON();
  },
  async execute(args: any, interaction: any, commands: any) {
    //code here
  },
};
