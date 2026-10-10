import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./packages/shared/src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"], // Fixes the toLowerCase TypeError by ignoring auth schemas
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://postgres:password@127.0.0.1:5454/zenvora?sslmode=disable",
  },
  verbose: true,
  strict: false,
});
