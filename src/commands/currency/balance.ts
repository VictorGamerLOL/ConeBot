import {
  ChatInputCommandInteraction,
  Guild,
  GuildMember,
  PermissionFlagsBits,
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
} from "discord.js";
import serverCl from "../../utils/bot-db";

export default {
  name: "balance",
  description:
    "Check your balance of a specific currency or all or another member's balance.",
  longDesc:
    "Checks the balance of the member specified in the command. If no member is specified, the balance of the command invoker is checked. If a currency is specified, \
    the balance of that one currency is checked. If no currency is specified, the balance of all currencies is checked. The currency ID argument will be prioritized \
    if both currency Id and name are provided.",
  locked: false,
  slashBuilder(): RESTPostAPIApplicationCommandsJSONBody {
    const command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addUserOption((option) =>
        option
          .setName("member")
          .setDescription("The member to check the balance of.")
          .setRequired(false)
      )
      .addIntegerOption((option) =>
        option
          .setName("currencyId")
          .setDescription("The currency ID to check the balance of.")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("currencyName")
          .setDescription("The currency name to check the balance of.")
          .setRequired(false)
      )
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);
    return command.toJSON();
  },
  async execute(
    args: { member: GuildMember },
    interaction: ChatInputCommandInteraction
  ) {
    const server = new serverCl(interaction.guild as Guild);
    await server.init();
    const member = await server.member(
      args.member ||
        (await interaction.guild?.members.fetch(interaction.user.id))
    );
  },
};
