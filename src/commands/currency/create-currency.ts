import * as Discord from "discord.js";
import serverCl from "../../utils/bot-db";

export default {
  name: "createcurrency",
  description: "Create a currency on this server.",
  longDesc:
    "Creates a currency on this server using the given arguments as settings. Some arguments are optional and will be set to their defaults if they are not provided.\
    Defaults include:\nVisible: true\nBaseValue: null\nEarnConfig: N/A\nEnabled: true\nPay: true",
  locked: false,
  slashBuilder(): Discord.RESTPostAPIApplicationCommandsJSONBody {
    const command = new Discord.SlashCommandBuilder()
      .setName(this.name)
      .setDescription(this.description)
      .addStringOption((option) =>
        option
          .setName("name")
          .setDescription("The name of the currency.")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName("symbol")
          .setDescription("The symbol of the currency.")
          .setRequired(true)
      )
      .addBooleanOption((option) =>
        option
          .setName("visible")
          .setDescription("Whether the currency is visible or not.")
          .setRequired(false)
      )
      .addNumberOption((option) =>
        option
          .setName("basevalue")
          .setDescription(
            "The value of the currency in terms of the base currency."
          )
          .setRequired(false)
      )
      .addBooleanOption((option) =>
        option
          .setName("pay")
          .setDescription(
            "Whether the currency can be paid between members or not."
          )
          .setRequired(false)
      )
      .setDMPermission(false)
      .setDefaultMemberPermissions(Discord.PermissionFlagsBits.ManageGuild);
    return command.toJSON();
  },
  async execute(args: any, interaction: Discord.ChatInputCommandInteraction) {
    const server = new serverCl(interaction.guild as Discord.Guild);
    await server.init();
    await server.createCurrency({
      currName: args.name,
      symbol: args.symbol,
      visible: args.visible,
      baseValue: args.basevalue,
      pay: args.pay,
    });
    interaction.editReply({
      content: `Currency ${args.name} created successfully.`,
    });
  },
} as command["default"];
