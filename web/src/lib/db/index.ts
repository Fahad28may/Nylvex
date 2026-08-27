import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

declare global {
  var __nylvexDbClient: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }
  return postgres(connectionString);
}

// Reuse the connection across hot reloads in dev instead of exhausting
// Postgres connections on every module reload.
const client = globalThis.__nylvexDbClient ?? createClient();
if (process.env.NODE_ENV !== "production") {
  globalThis.__nylvexDbClient = client;
}

export const db = drizzle(client, { schema });
