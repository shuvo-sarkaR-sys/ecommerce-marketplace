import fs from "node:fs";
import path from "node:path";

/**
 * Avoids the dotenv package (seen to have loading issues on Windows Node
 * v22 on a previous project) by parsing .env directly. All modules that
 * read process.env in this codebase do so lazily inside functions rather
 * than at module top-level, so it's enough to call this once before the
 * server actually starts handling requests.
 */
export function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.warn(".env not found -- copy .env.example to .env first.");
    return;
  }

  const contents = fs.readFileSync(envPath, "utf-8");
  for (const line of contents.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
