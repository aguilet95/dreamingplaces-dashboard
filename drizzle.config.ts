import 'dotenv/config';
import type { Config } from 'drizzle-kit';
import { getSafeEnv } from './app/lib/get-safe-env';
 
export default {
	schema: './app/db/schemas/*',
	out: './drizzle/migrations',
	driver: 'pg',
	dbCredentials: {
    connectionString: getSafeEnv("PG_CONNECTION_STRING"),
  },
} satisfies Config;
