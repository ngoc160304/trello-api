/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
const MONGO_URI = 'mongodb+srv://ngoc52627:ZG5a0VE0ebDIzNep@cluster0.usg9bp2.mongodb.net/';
const DATABASE_NAME = 'trello';
import { MongoClient, ServerApiVersion } from 'mongodb';

let trelloDatabaseInstance = null;

const mongoClientInstance = new MongoClient(MONGO_URI, {
  serverApi: {
    version: ServerApiVersion.v1, // co the de giong nay hoac khong doc them trong tai lieu
    strict: true,
    deprecationErrors: true
  }
});
export const CONNECT_DB = async () => {
  await mongoClientInstance.connect();
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME);
};
// Chi goi ham nay sau khi connect thanh cong toi DB
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to DB first');
  return trelloDatabaseInstance;
};
