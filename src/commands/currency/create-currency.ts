import {
  RESTPostAPIApplicationCommandsJSONBody,
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChatInputCommandInteraction,
  Guild,
} from "discord.js";
import serverCl from "../../utils/bot-db";

export default {
  name: "create-currency",
  description: "Create a currency on this server.",
  longDesc:
    "Creates a currency on this server using the given arguments as settings. Some arguments are optional and will be set to their defaults if they are not provided.\
    Defaults include:\nVisible: true\nBaseValue: null\nEarnConfig: N/A\nEnabled: true\nPay: true",
  locked: false,
  slashBuilder(): RESTPostAPIApplicationCommandsJSONBody {
    const command = new SlashCommandBuilder()
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
      .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
    return command.toJSON();
  },
  async execute(args: any, interaction: ChatInputCommandInteraction) {
    const server = new serverCl(interaction.guild as Guild);
    await server.init();
    const exists = await server.hasCurrency(args.name);
    if (exists) {
      interaction.editReply({
        content: `There is already a currency with the name of ${args.name} on this server.`,
      });
      return;
    }
    await server.createCurrency({
      CurrName: args.name,
      Symbol: args.symbol,
      Visible: args.visible,
      BaseValue: args.basevalue,
      Pay: args.pay, //Unfortunately command options need to be lowercase, so we need to do this kind of thing.
    });
    interaction.editReply({
      content: `Currency ${args.name} created successfully.`,
    });
  },
} as command["default"];
