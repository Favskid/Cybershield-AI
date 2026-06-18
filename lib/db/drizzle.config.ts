import { defineConfig } from "drizzle-kit";
import path from "path";
import { config } from "dotenv";

// Load .env from the monorepo root
const envRoot = config({ path: path.resolve(__dirname, "../../.env") });
// Fallback: also try local .env
const envLocal = config({ path: path.resolve(__dirname, ".env") });

const dbUrl = envRoot.parsed?.DATABASE_URL || envLocal.parsed?.DATABASE_URL;
if (dbUrl) {
  process.env.DATABASE_URL = dbUrl;
}

console.log('DATABASE_URL:', process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL not found — ensure .env file exists at the project root.");
}

export default defineConfig({
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
