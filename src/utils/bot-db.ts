/*
 *
 * This thing is basically a fancy frontend to the sql-handler file. It controls everything on a per-server basis using the server class.
 * This is also so I can say I used classes in case this ends up being used as my school project.
 *
 */
import { Guild, GuildMember } from "discord.js";
import db from "./db-handler";
import member from "./subclasses/member";

class server {
  private _guild: Guild;

  constructor(guild: Guild) {
    this._guild = guild;
  }

  async init(): Promise<void> {
    const result = await db.findServer(this._guild.id);
    if (result === false) {
      await db.createServer(this._guild.id);
    }
  }

  async currencies(): Promise<shortCurr[] | undefined> {
    const result = await db.getCurrencies(this._guild.id);
    return result;
  }

  async hasCurrency(currencyName: string): Promise<boolean> {
    const result = await db.hasCurrency(this._guild.id, currencyName);
    return result;
  }

  async createCurrency(
    args: Omit<
      PartialExcept<curr, "CurrName" | "Symbol">,
      "Id" | "Base" | "EarnConfig"
    >
  ): Promise<void> {
    await db.createCurrency({
      guildId: this._guild.id,
      ...args,
    });
  }

  async deleteCurrency(currencyName: string): Promise<void> {
    await db.deleteCurrency(this._guild.id, currencyName);
  }

  async member(guildMember: GuildMember): Promise<member> {
    const result = new member({ guildMember, serverClParam: this });
    await result.init();
    return result;
  }
}
export default server;
