import { Document, FindOptions, MongoClient } from "mongodb";
import * as dotenv from "dotenv";
import NodeCache from "node-cache";
dotenv.config();

const cache = new NodeCache();

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
    const foundCollectionServers = collections.find((collection) => {
      if (collection.collectionName === "servers") {
        return true;
      } else return false;
    });
    const foundCollectionBalances = collections.find((collection) => {
      if (collection.collectionName === "balances") {
        return true;
      } else return false;
    });
    const foundCollectionInventories = collections.find((collection) => {
      if (collection.collectionName === "inventories") {
        return true;
      } else return false;
    });
    const foundCollectionCurrencies = collections.find((collection) => {
      if (collection.collectionName === "currencies") {
        return true;
      } else return false;
    });
    if (foundCollectionServers === undefined)
      await db.createCollection("servers");
    if (foundCollectionBalances === undefined)
      await db.createCollection("balances");
    if (foundCollectionInventories === undefined)
      await db.createCollection("inventories");
    if (foundCollectionCurrencies === undefined)
      await db.createCollection("currencies");
  },
  findServer: async (guildId: string): Promise<boolean> => {
    const cached: boolean | undefined = cache.get(`findServer-${guildId}`);
    if (cached !== undefined) {
      if (cached !== false)
        cache.ttl(`findServer-${guildId}`, 60 * 60 * 60 * 24); // refresh cache
      return cached;
    }
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
    if (result !== null) {
      cache.set(`findServer-${guildId}`, true, 60 * 60 * 60 * 24); //24 hours
      return true;
    }
    return false;
  },
  createServer: async (guildId: string): Promise<void> => {
    db.collection("servers").updateOne(
      { guildId: guildId },
      {
        $setOnInsert: {
          guildId: guildId,
          currencies: [],
        },
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

    db.collection("currencies").updateOne(
      { guildId: guildId },
      {
        $setOnInsert: {
          guildId: guildId,
          CurrName: CurrName,
          Symbol: Symbol,
          Visible: Visible === undefined ? true : Visible,
          Base: false,
          BaseValue: BaseValue === undefined ? null : BaseValue,
          Pay: Pay === undefined ? true : Pay,
          /**
           * We store the configuration for earning like this because we will have
           * separate lists for each currency and depending on the current mode for
           * each category of earning, aka if it is whitelist-based or blacklist-based.
           * Channels take higher priority than roles when determining whether it
           * should be earned or not as it is more specific.
           */
          ChannelsIsWhitelist: false,
          RolesIsWhitelist: false,
          ChannelsWhitelist: [],
          RolesWhitelist: [],
          ChannelsBlacklist: [],
          RolesBlacklist: [],
          /**
           * Now for the actual earning rates.
           */
          EarnMin: 0,
          EarnMax: 0,
          EarnTimeout: 30, //Represents seconds
          /**
           * Now configs for when earning multipliers should be applied. When a new
           * multiplier is added, we add a field to the embedded documents in the
           * fields below. The multiplier will be applied to the currency after it has
           * picked a random number between EarnMin and EarnMax. Note to self: to
           * delete a multiplier from the database, we will have to use the $unset
           * operator.
           */
          RoleMultipliers: {},
          ChannelMultipliers: {},
        },
      },
      { upsert: true }
    );
  },
  createMember: async (guildId: String, memberId: String): Promise<void> => {
    await db.collection("servers").updateOne(
      { guildId: guildId },
      {
        $push: { members: { $each: [{ memberId: memberId, currencies: {} }] } },
      },
      { upsert: true }
    );
  },
  getCurrencies: async (guildId: string): Promise<shortCurr[] | undefined> => {
    const cached: shortCurr[] | undefined = cache.get(
      `getCurrencies-${guildId}`
    );
    if (cached !== undefined) return cached;
    const result = await db
      .collection("servers")
      .findOne(
        { guildId: guildId },
        { projection: { "currencies.CurrName": 1, "currencies.Symbol": 1 } }
      );
    if (result === null) {
      let thisFile = await import("./db-handler");
      await thisFile.default.createServer(guildId);
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
          guildId: 1,
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
  getMember: async (
    guildId: string,
    memberId: string
  ): Promise<member | undefined> => {
    const result = await db.collection("servers").findOne({
      guildId: guildId,
      members: { $elemMatch: { memberId: memberId } },
    });
    return result === null
      ? undefined
      : (((result.members[0] as member).guildId = guildId), result.members[0]);
  },
  giveCurrency: async (
    guildId: string,
    memberId: string,
    currencyName: string,
    amount: number
  ): Promise<void> => {
    let query: any = {
      // So it can shut up about the type
      $inc: {},
    };
    query.$inc[`members.$.currencies.${currencyName}`] = amount;
    await db.collection("servers").updateOne(
      {
        guildId: guildId,
        members: { $elemMatch: { memberId: memberId } },
      },
      query
    );
  },
};
