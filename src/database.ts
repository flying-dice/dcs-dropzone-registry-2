import { MongoClient } from "mongodb";
import { config } from "./config.ts";

const client = new MongoClient(config.mongoUri);
await client.connect();

export const db = client.db(config.database);
export const modsCollection = db.collection(config.modCollection);
