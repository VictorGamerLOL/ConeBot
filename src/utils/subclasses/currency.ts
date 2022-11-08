import { Guild } from "discord.js";
import sql from "../sql-handler";

class currency {
  private _guild: Guild;
  constructor(args: {
    guild: Guild;
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
        BaseValue: args.baseValue,
        Pay: args.pay,
      });
    }
  }
}

export default currency;
