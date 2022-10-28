/*
 *
 * This thing is basically a fancy frontend to the sql-handler file. It controls everything on a per-server basis using the server class.
 * This is also so I can say I used classes in case this ends up being used as my school project.
 *
 */
import Discord from "discord.js";
import sql from "./sql-handler";

class server {
  private _guild: Discord.Guild;

  constructor(guild: Discord.Guild) {
    this._guild = guild;
  }

  async init(): Promise<void> {
    const result = await sql.findServer(this._guild.id);
    if (result === false) {
      await sql.createServer(this._guild.id);
    }
  }

  async currencies(): Promise<
    { Id: Number; CurrName: String; Symbol: String }[] | undefined
  > {
    const result = await sql.getCurrencies(this._guild.id);
    return result;
  }

  async hasCurrency(Id: Number): Promise<boolean> {
    const result = await sql.hasCurrency(this._guild.id, Id);
    return result;
  }

  async createCurrency(args: {
    currName: string;
    symbol: string;
    visible?: boolean;
    base?: boolean;
    baseValue?: number;
    earnConfig?: JSON;
    pay?: boolean;
  }): Promise<void> {
    await sql.createCurrency({
      guildId: this._guild.id,
      CurrName: args.currName,
      Symbol: args.symbol,
      Visible: args.visible,
      BaseValue: args.baseValue,
      EarnConfig: args.earnConfig,
      Pay: args.pay,
    });
  }

  async deleteCurrency(currencyId: Number): Promise<void> {
    const currency = await sql.getCurrency(this._guild.id, currencyId);
    if (currency !== undefined) {
      await sql.deleteCurrency(this._guild.id, currencyId, currency.CurrName);
    }
  }
}
export default server;
