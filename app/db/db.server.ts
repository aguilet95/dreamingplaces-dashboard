import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getSafeEnv } from "../lib/get-safe-env";
import * as schema from "./schemas";

const queryClient = postgres(getSafeEnv("PG_CONNECTION_STRING"));
export const db = drizzle(queryClient, {
  schema,
});
