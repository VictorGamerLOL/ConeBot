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
  async currencies(): Promise<
    { Id: Number; CurrName: String; Symbol: String }[] | undefined
  > {
    const result = await sql.getCurrencies(this._guild.id);
    return result;
  }
}
export default server;
