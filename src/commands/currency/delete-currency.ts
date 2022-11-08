import {
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Guild,
} from "discord.js";
import serverCl from "../../utils/bot-db";

export default {
  name: "deletecurrency",
  description: "Delete a currency from this server.", // For some strange reason the inline SQL highlighting applies here.
  longDesc:
    "Deletes a currency from this server, given its id. This action cannot be undone.",
  locked: false,
  slashBuilder(): RESTPostAPIApplicationCommandsJSONBody {
    const command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addIntegerOption((option) =>
        option
          .setName("id")
          .setDescription("The id of the currency to delete.")
          .setRequired(true)
      )
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
    return command.toJSON();
  },
  async execute(args: any, interaction: ChatInputCommandInteraction) {
    const server = new serverCl(interaction.guild as Guild);
    await server.init();
    if (await server.hasCurrency(args.id)) {
      await server.deleteCurrency(args.id);
      interaction.editReply({
        content: `Successfully deleted currency with id ${args.id}.`,
      });
    } else {
      interaction.editReply({
        content: `There is no currency with id ${args.id} on this server.`,
      });
    }
  },
} as command["default"];
