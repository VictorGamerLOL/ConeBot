import { GuildMember } from "discord.js";
import db from "../db-handler";
import serverCl from "../bot-db";

class member {
  public server: serverCl;
  private _guildMember: GuildMember;
  constructor(args: { guildMember: GuildMember; serverClParam?: serverCl }) {
    this._guildMember = args.guildMember;
    if (args.serverClParam === undefined) {
      this.server = new serverCl(this._guildMember.guild);
    } else {
      this.server = args.serverClParam;
    }
  }

  async init() {
    !!(await db.getMember(this._guildMember.guild.id, this._guildMember.id))
      ? undefined // If the member exists, do nothing.
      : await db.createMember(this._guildMember.guild.id, this._guildMember.id);
    this.server.initDone === false ? await this.server.init() : undefined;
  }
}

export default member;
