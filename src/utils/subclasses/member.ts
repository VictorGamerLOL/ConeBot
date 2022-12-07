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
    !!(await db.getMemberBalances(
      this._guildMember.guild.id,
      this._guildMember.id
    ))
      ? undefined // If the member exists, do nothing.
      : await db.createMember(this._guildMember.guild.id, this._guildMember.id);
    this.server.initDone === false ? await this.server.init() : undefined;
  }

  async balances(): Promise<globalThis.memberBalances> {
    let result = await db.getMemberBalances(
      this._guildMember.guild.id,
      this._guildMember.id
    );
    result === undefined
      ? await db.createMember(
          this._guildMember.guild.id.toString(),
          this._guildMember.id.toString()
        )
      : undefined;
    result = (await db.getMemberBalances(
      this._guildMember.guild.id,
      this._guildMember.id
    )) as globalThis.memberBalances;
    return result;
  }
}

export default member;
