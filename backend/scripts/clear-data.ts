import { loadEnv } from "../src/config/loadEnv";
loadEnv();

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Missing MONGODB_URI -- set it in backend/.env.");
if (process.env.CONFIRM_CLEAR_DATA !== "YES") {
  throw new Error("Refusing to clear the database. Set CONFIRM_CLEAR_DATA=YES to confirm this destructive operation.");
}

const mongoUri = MONGODB_URI;

async function clearData() {
  await mongoose.connect(mongoUri);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log("Database cleared.");
}

clearData().catch((error) => {
  console.error(error);
  process.exit(1);
});
