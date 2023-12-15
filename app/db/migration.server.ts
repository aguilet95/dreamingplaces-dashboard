import postgres from "postgres";
import { getSafeEnv } from "../lib/get-safe-env";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(getSafeEnv("PG_CONNECTION_STRING"), { max: 1 });

export const runMigrations = async () => migrate(drizzle(migrationClient), { migrationsFolder: "/usr/src/app/drizzle/migrations" });