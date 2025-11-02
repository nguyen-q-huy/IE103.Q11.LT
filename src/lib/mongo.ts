import { MongoClient, Db } from 'mongodb';

const uri = 'mongodb://localhost:27017';
const dbName = 'QLBenhVien';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function getMongoConnection(): Promise<Db> {
  if (!client || !db) {
    client = new MongoClient(uri);
    await client.connect();
    db = client.db(dbName);
    console.log('✅ Connected to MongoDB');
  }
  return db;
}

export async function getMaxValue(  collectionName: string, fieldName: string): Promise<number | null> {
  const db = await getMongoConnection();
  const result = await db.collection(collectionName)
        .find({}, { projection: { [fieldName]: 1, _id: 0 } })
        .sort({ [fieldName]: -1 })
        .limit(1)
        .toArray();

    if (result.length > 0) {
        return result[0][fieldName] as number;
    } else {
        return 0;
    }
}