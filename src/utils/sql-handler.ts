import db from "./sql-conn";
import logger from "./logger";
import { RowDataPacket } from "mysql2";

export default {
  init: async () => {
    return;
    // const tables = (await db.query("SHOW TABLES LIKE '%config%';"))[0] as RowDataPacket[]
    // console.log(tables)
  },

  findServer: async (guildId: string): Promise<boolean> => {
    const result = (
      await db.query(`SHOW TABLES LIKE "%${guildId}%"`)
    )[0] as RowDataPacket[];
    if (result.length > 1) {
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
    console.log(result1);
    console.log(result2);
  },

  createCurrency: async (args: {
    guildId: String;
    CurrName: String;
    Symbol: String;
    Visible?: Boolean;
    BaseValue?: Number;
    EarnConfig?: JSON;
    Pay?: Boolean;
  }): Promise<void> => {
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
    if (args.EarnConfig !== undefined) {
      query1 += ", EarnConfig";
      query2 += ", ?";
      arr.push(args.EarnConfig);
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

  deleteCurrency: async (
    guildId: String,
    currencyId: Number,
    CurrName: String
  ): Promise<void> => {
    await db.execute(`DELETE FROM ${guildId}currencies WHERE Id = ?`, [
      currencyId,
    ]);
    await db.execute(`ALTER TABLE ${guildId}users DROP COLUMN ${CurrName};`);
  },

  getCurrencies: async (
    guildId: string
  ): Promise<
    { Id: Number; CurrName: String; Symbol: String }[] | undefined
  > => {
    const result = (
      await db.query(`SELECT Id, CurrName, Symbol FROM ${guildId}currencies`)
    )[0] as { Id: Number; CurrName: String; Symbol: String }[];
    if (result.length > 0) {
      return result;
    } else {
      return undefined;
    }
  },

  getCurrency: async (
    guildId: String,
    id: Number
  ): Promise<
    | {
        Id: Number;
        CurrName: String;
        Symbol: String;
        Visible: Boolean;
        Base: Boolean;
        BaseValue: Number;
        EarnCOnfig: JSON;
        Pay: Boolean;
      }
    | undefined
  > => {
    const result = (await db.query(
      `SELECT * FROM ${guildId}currencies WHERE Id = ?`,
      [id]
    )) as RowDataPacket[];
    if (result[0][0] !== undefined) {
      return result[0][0];
    } else {
      return undefined;
    }
  },

  hasCurrency: async (guildId: String, Id: Number): Promise<boolean> => {
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