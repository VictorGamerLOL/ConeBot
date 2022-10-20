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
    Base?: Boolean;
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
    if (args.Base !== undefined) {
      query1 += ", Base";
      query2 += ", ?";
      arr.push(args.Base);
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
    const result = await db.execute(query1 + query2, arr);
    console.log(result);
  },
};
