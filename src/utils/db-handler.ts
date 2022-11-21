import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const URI = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB;

if (URI === undefined) {
  throw new Error(
    "No mongo URI provided in environment variables or .env file"
  );
}
if (dbName === undefined) {
  throw new Error(
    "No mongo database name provided in environment variables or .env file"
  );
}

const client = new MongoClient(URI);
const db = client.db(dbName);

export default {
  init: async () => {
    const collections = await db.collections();
    const foundCollection = collections.find((collection) => {
      console.log(collection);
      if (collection.collectionName === "servers") {
        console.log("Found collection");
        return true;
      } else return false;
    });
    if (foundCollection === undefined) {
      await db.createCollection("servers");
    }
  },
  findServer: async (guildId: string): Promise<boolean> => {
    const result = await db.collection("servers").findOne(
      {
        guildId: guildId,
      },
      {
        projection: {
          //"Human readable" they said.
          _id: 1,
        },
      }
    );
    return false;
  },
  createServer: async (guildId: string): Promise<void> => {
    db.collection("servers").updateOne(
      { guildId: guildId },
      {
        $set: { guildId: guildId, currencies: [], members: [], earnConfig: {} },
      },
      { upsert: true }
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
    let { guildId, CurrName, Symbol, Visible, Pay, BaseValue } = args;
    let currency: Omit<curr, "Id"> = {
      CurrName: CurrName,
      Symbol: Symbol,
      Visible: Visible === undefined ? true : Visible,
      Base: false,
      BaseValue: BaseValue === undefined ? null : BaseValue,
      EarnConfig: {},
      Pay: Pay === undefined ? true : Pay,
    };

    db.collection("servers").updateOne(
      { guildId: guildId },
      { $push: { currencies: currency } },
      { upsert: true }
    );
  },
  createMember: async (memberId: String, serverId: String): Promise<void> => {
    db.collection("servers").updateOne(
      { guildId: serverId },
      { $push: { members: { memberId: memberId, inventory: {} } } },
      { upsert: true }
    );
  },
  getCurrencies: async (guildId: string): Promise<shortCurr[] | undefined> => {
    const result = await db
      .collection("servers")
      .findOne(
        { guildId: guildId },
        { projection: { "currencies.CurrName": 1, "currencies.Symbol": 1 } }
      );
    if (result === null) {
      (this as any).createServer(guildId); //Workaround for this being undefined
      return undefined;
    }
    return result.currencies.length !== 0 ? result.currencies : undefined;
  },
  hasCurrency: async (
    guildId: string,
    currencyName: string
  ): Promise<boolean> => {
    let result = await db.collection("servers").findOne(
      {
        guildId: guildId,
        currencies: { $elemMatch: { CurrName: currencyName } },
      },
      {
        projection: {
          _id: 1,
        },
      }
    );
    return result === null ? false : true;
  },
  deleteCurrency: async (
    guildId: string,
    currencyName: string
  ): Promise<void> => {
    db.collection("servers").updateOne(
      { guildId: guildId },
      { $pull: { currencies: { CurrName: currencyName } } }
    );
  },
  getCurrency: async (
    guildId: string,
    currencyName: string
  ): Promise<curr | undefined> => {
    const result = await db.collection("servers").findOne(
      {
        guildId: guildId,
        currencies: { $elemMatch: { CurrName: currencyName } },
      },
      {
        projection: {
          "currencies.$": 1,
        },
      }
    );
    return result === null ? undefined : result.currencies[0];
  },
};
