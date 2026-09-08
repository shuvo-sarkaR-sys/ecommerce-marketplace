import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "Missing MONGODB_URI. Copy .env.example to .env and set your MongoDB Atlas connection string.",
    );
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { maxPoolSize: 10 });
  console.log("MongoDB connected");
}
