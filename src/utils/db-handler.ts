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
    const foundCollectionItems = collections.find((collection) => {
      if (collection.collectionName === "items") {
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
    if (foundCollectionItems === undefined) await db.createCollection("items"); // Prettier does not know what consistency is.
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
    /**
     * Since we have 2 places where members are present we put one
     * in both :).
     */
    await db.collection("balances").updateOne(
      { guildId: guildId, memberId: memberId },
      {
        $setOnInsert: {
          guildId: guildId,
          memberId: memberId,
          currencies: {},
        },
      },
      { upsert: true }
    );
    await db.collection("inventories").updateOne(
      { guildId: guildId, memberId: memberId },
      {
        $setOnInsert: {
          guildId: guildId,
          memberId: memberId,
          items: {},
        },
      },
      { upsert: true }
    );
  },
  getCurrencies: async (guildId: string): Promise<shortCurr[] | undefined> => {
    const cached: shortCurr[] | undefined = cache.get(
      `getCurrencies-${guildId}`
    );
    if (cached !== undefined) return cached;
    const result = db
      .collection("currencies")
      .find({ guildId: guildId }, { projection: { CurrName: 1, Symbol: 1 } });
    let currencies: shortCurr[] = [];
    await result.forEach((doc) => {
      let currency: shortCurr = {
        CurrName: doc.CurrName,
        Symbol: doc.Symbol,
      };
      currencies.push(currency);
    });
    cache.set(`getCurrencies-${guildId}`, currencies, 60 * 60 * 60 * 24); //24 hours
    return currencies.length === 0 ? undefined : currencies;
  },
  hasCurrency: async (guildId: string, CurrName: string): Promise<boolean> => {
    let result = await db.collection("currencies").findOne(
      {
        guildId: guildId,
        CurrName: CurrName,
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
  deleteCurrency: async (guildId: string, CurrName: string): Promise<void> => {
    db.collection("currencies").deleteOne({
      guildId: guildId,
      CurrName: CurrName,
    });
  },
  getCurrency: async (
    guildId: string,
    CurrName: string
  ): Promise<curr | undefined> => {
    const result = await db.collection("currencies").findOne({
      guildId: guildId,
      CurrName: CurrName,
    });
    if (result === null) return undefined;
    const currency: curr = {
      ...(result as unknown as curr), //I know what I am doing so SHUT UP TYPESCRIPT. God awfully strict typing system.
    };
    return currency;
  },
  getMemberBalances: async (
    guildId: string,
    memberId: string
  ): Promise<memberBalances | undefined> => {
    const result = await db.collection("balances").findOne({
      guildId: guildId,
      memberId: memberId,
    });
    if (result === null) return undefined;
    const member: memberBalances = {
      ...(result as unknown as memberBalances),
    };
    return member;
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
    query.$inc[`currencies.${currencyName}`] = amount;
    await db.collection("balances").updateOne(
      {
        guildId: guildId,
        members: { $elemMatch: { memberId: memberId } },
      },
      query
    );
  },
};
