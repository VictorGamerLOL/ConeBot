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
    return false;
  },
};
