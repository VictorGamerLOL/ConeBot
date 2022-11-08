import {
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  PermissionFlagsBits,
  Guild,
  EmbedBuilder,
} from "discord.js";
import serverCl from "../../utils/bot-db";
//More imports here

export default {
  name: "listcurrencies",
  description: "List all of the currencies available on this server briefly.",
  longDesc:
    "Lists the id, name and symbol of all currencies available on this server.",
  locked: false,
  slashBuilder(): RESTPostAPIApplicationCommandsJSONBody {
    const command = new SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .setDMPermission(false)
      .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages);
    return command.toJSON();
  },
  async execute(args, interaction) {
    const server = new serverCl(interaction.guild as Guild);
    await server.init();
    const currencies = await server.currencies();
    if (currencies === undefined)
      return interaction.editReply({
        content: "There are no currencies on this server.",
      });
    const embed = new EmbedBuilder()
      .setTitle("Currencies")
      .setDescription("Here are all of the currencies on this server:")
      .setColor("DarkGreen");
    for (const currency of currencies) {
      embed.addFields({
        name: `${currency.Symbol} - ${currency.CurrName}`,
        value: `ID: ${currency.Id}`,
        inline: true,
      });
    }
    interaction.editReply({ embeds: [embed] });
  },
} as command["default"];
