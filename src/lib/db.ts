import { MongoClient, Db } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is required");
}

const client = new MongoClient(process.env.MONGODB_URI);

const globalForMongo = globalThis as unknown as {
  _mongoClientPromise: Promise<MongoClient> | undefined;
};

const clientPromise =
  globalForMongo._mongoClientPromise ?? client.connect();

if (process.env.NODE_ENV !== "production") {
  globalForMongo._mongoClientPromise = clientPromise;
}

export { clientPromise };

export async function getDb(): Promise<Db> {
  return (await clientPromise).db();
}
