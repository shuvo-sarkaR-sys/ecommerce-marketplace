import { loadEnv } from "../src/config/loadEnv";
loadEnv();

import mongoose from "mongoose";
import { User } from "../src/models/User";
import { hashPassword } from "../src/utils/password";

async function updateAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const mongoUri = process.env.MONGODB_URI;

  if (!email || !password || !mongoUri) {
    throw new Error("ADMIN_EMAIL, ADMIN_PASSWORD, and MONGODB_URI are required.");
  }

  await mongoose.connect(mongoUri);
  const admin = await User.findOne({ role: "admin" }).select("+passwordHash");
  if (!admin) throw new Error("No admin account found.");

  admin.email = email;
  admin.passwordHash = await hashPassword(password);
  admin.emailVerified = true;
  await admin.save();
  console.log(`Updated admin account: ${email}`);
  await mongoose.disconnect();
}

updateAdmin().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect().catch(() => undefined);
  process.exit(1);
});