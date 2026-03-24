import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@fitarena/db/schema";
import { config } from "./config";

const sql = neon(config.databaseUrl);
export const db = drizzle(sql, { schema });
