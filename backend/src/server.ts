import { loadEnv } from "./config/loadEnv";
loadEnv();

import { createApp } from "./app";
import { connectDB } from "./db/connect";

async function main() {
  await connectDB();

  const app = createApp();
  const port = Number(process.env.PORT ?? 5000);

  app.listen(port, () => {
    console.log(`MAISON API listening on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
