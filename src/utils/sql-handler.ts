import db from "./sql-conn";
import logger from "./logger";
import { RowDataPacket } from "mysql2";
import NodeCache from "node-cache";
import { GuildMember } from "discord.js";

const cache = new NodeCache();

export default {
  init: async () => {
    return;
    //TODO: Find a reason for a server to have config files.
    // const tables = (await db.query("SHOW TABLES LIKE '%config%';"))[0] as RowDataPacket[]
    // console.log(tables)
  },

  findServer: async (guildId: string): Promise<boolean> => {
    const cached: boolean | undefined = cache.get(`findServer-${guildId}`);
    if (cached !== undefined) {
      if (cached !== false)
        cache.ttl(`findServer-${guildId}`, 60 * 60 * 60 * 24); // refresh cache
      return cached;
    }
    /*Since database reads are very computationally expensive we use RAM to store these simple booleans :).
      If you don't like it you can cry about it. At least I think node-cache uses RAM... */
    const result = (
      await db.query(`SHOW TABLES LIKE "%${guildId}%"`)
    )[0] as RowDataPacket[];
    if (result.length > 1) {
      cache.set(`findServer-${guildId}`, true, 60 * 60 * 60 * 24); //24 hours
      return true;
    } else {
      return false;
    }
  },

  createServer: async (guildId: string): Promise<void> => {
    const result1 = await db.execute(
      `CREATE TABLE IF NOT EXISTS ${guildId}users (
        Id varchar(255) NOT NULL, 
        Inventory JSON NOT NULL DEFAULT '{}', 
        PRIMARY KEY (Id)
        );`
    );
    const result2 = await db.execute(
      `CREATE TABLE IF NOT EXISTS ${guildId}currencies (
        Id int NOT NULL AUTO_INCREMENT, 
        CurrName varchar(255) NOT NULL, 
        Symbol varchar(255) NOT NULL,
        Visible boolean NOT NULL DEFAULT 1, 
        Base boolean NOT NULL DEFAULT 0, 
        BaseValue int, 
        EarnConfig JSON NOT NULL DEFAULT '{}', 
        Pay boolean NOT NULL DEFAULT 1, 
        PRIMARY KEY (Id)
        );`
    );
  },

  createCurrency: async (
    args: Omit<
      PartialExcept<curr, "CurrName" | "Symbol">,
      "Id" | "Base" | "EarnConfig"
    > & {
      guildId: string;
    }
  ): Promise<void> => {
    let query1 = `INSERT INTO ${args.guildId}currencies (CurrName, Symbol`;
    let query2 = `) VALUES (?, ?`;
    let arr: any[] = [args.CurrName, args.Symbol];
    if (args.Visible !== undefined) {
      query1 += ", Visible";
      query2 += ", ?";
      arr.push(args.Visible);
    }
    if (args.BaseValue !== undefined) {
      query1 += ", BaseValue";
      query2 += ", ?";
      arr.push(args.BaseValue);
    }
    if (args.Pay !== undefined) {
      query1 += ", Pay";
      query2 += ", ?";
      arr.push(args.Pay);
    }
    query2 += ")";
    await db.execute(query1 + query2, arr);
    await db.execute(
      `ALTER TABLE ${args.guildId}users ADD COLUMN ${args.CurrName} int NOT NULL DEFAULT 0;`
    );
  },

  createMember: async (memberId: String, serverId: String): Promise<void> => {
    const cached: Boolean | undefined = cache.get(
      `createMember-${memberId}-${serverId}`
    );
    if (cached !== undefined) return;
    await db.execute(
      `INSERT OR IGNORE INTO ${serverId}users (Id) VALUES (?);`, //This doubles down as a check if member exists and if not creates them.
      [memberId]
    );
    cache.set(`createMember-${memberId}-${serverId}`, true, 60 * 60 * 60 * 24); //24 hours because any database operation is expensive.
  },

  deleteCurrency: async (
    guildId: String,
    currencyId: Number,
    CurrName: String
  ): Promise<void> => {
    await db.execute(`DELETE FROM ${guildId}currencies WHERE Id = ?`, [
      currencyId,
    ]);
    await db.execute(`ALTER TABLE ${guildId}users DROP COLUMN ${CurrName};`);
    cache.del([
      `getCurrencies-${guildId}`,
      `getCurrency-${guildId}-${currencyId}`,
    ]); // Delete cache of said currency to stop unfortunate accidents :).
  },

  getCurrencies: async (guildId: string): Promise<shortCurr[] | undefined> => {
    const cached: shortCurr[] | undefined = cache.get(
      `getCurrencies-${guildId}`
    );
    if (cached !== undefined) return cached;
    const result = (
      await db.query(`SELECT Id, CurrName, Symbol FROM ${guildId}currencies`)
    )[0] as { Id: number; CurrName: string; Symbol: string }[];
    if (result.length > 0) {
      cache.set(`getCurrencies-${guildId}`, result, 120); //2 minutes
      return result;
    } else {
      return undefined;
    }
  },

  getCurrency: async (
    guildId: String,
    id: Number
  ): Promise<curr | undefined> => {
    const cached: curr | undefined = cache.get(`getCurrency-${guildId}-${id}`);
    if (cached !== undefined) return cached;
    const result = (await db.query(
      `SELECT * FROM ${guildId}currencies WHERE Id = ?`,
      [id]
    )) as RowDataPacket[];
    if (result[0][0] !== undefined) {
      cache.set(`getCurrency-${guildId}-${id}`, result[0][0], 120); //2 minutes
      return result[0][0];
    } else {
      return undefined;
    }
  },

  hasCurrency: async (guildId: String, Id: Number): Promise<boolean> => {
    // Its dangerous to cache this so I'd rather not.
    const results = (await db.query(
      `SELECT EXISTS(SELECT Id FROM ${guildId}currencies WHERE Id = ?)`,
      [Id]
    )) as RowDataPacket[];
    for (const key in results[0][0]) {
      if (results[0][0][key] === 1) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },
};
