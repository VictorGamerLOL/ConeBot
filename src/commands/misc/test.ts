import Discord from "discord.js";
import server from "../../utils/bot-db";

export default {
  name: "test",
  description: "Test command",
  longDesc: "This is a test command",
  locked: false,
  slashBuilder(): Discord.RESTPostAPIApplicationCommandsJSONBody {
    const command = new Discord.SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(Discord.PermissionFlagsBits.SendMessages);
    return command.toJSON();
  },
  async execute(args: any, interaction: Discord.ChatInputCommandInteraction) {
    if (!interaction.guild) return;
    const db = new server(interaction.guild);
    console.log(await db.currencies());
  },
};
