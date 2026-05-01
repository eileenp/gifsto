import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

export function getDb() {
  const sql = neon(env.databaseUrl);
  return drizzle(sql, { schema: fullSchema });
}
