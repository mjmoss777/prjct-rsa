import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}

export const db = drizzle({ connection: process.env.DATABASE_URL, schema });
