import Discord from "discord.js";
import sql from "./sql-handler";

class server {
  private _guild: Discord.Guild;
  constructor(guild: Discord.Guild) {
    this._guild = guild;
    sql.findServer(guild.id).then((result) => {
      if (result === false) {
        sql.createServer(guild.id);
      }
    });
  }
  public currency = class {
    private _guild: Discord.Guild;

    constructor(args: {
      guild: Discord.Guild;
      currName: string;
      symbol: string;
      visible?: boolean;
      base?: boolean;
      baseValue?: number;
      earnConfig?: JSON;
      pay?: boolean;
    }) {
      this._guild = args.guild;
      if (args.currName !== undefined && args.symbol !== undefined) {
        sql.createCurrency({
          guildId: this._guild.id,
          CurrName: args.currName,
          Symbol: args.symbol,
          Visible: args.visible,
          Base: args.base,
          BaseValue: args.baseValue,
          EarnConfig: args.earnConfig,
          Pay: args.pay,
        });
      }
    }
  };
}
export default server;
