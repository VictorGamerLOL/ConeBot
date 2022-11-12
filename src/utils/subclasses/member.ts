import { GuildMember } from "discord.js";
import sql from "../sql-handler";
import serverCl from "../bot-db";

class member {
  public server: serverCl;
  private _guildMember: GuildMember;
  constructor(args: { guildMember: GuildMember; serverClParam: serverCl }) {
    this._guildMember = args.guildMember;
    this.server = args.serverClParam;
  }

  async init() {
    await sql.createMember(this._guildMember.id, this._guildMember.guild.id);
  }
}

export default member;
