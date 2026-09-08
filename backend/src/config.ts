import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const CONFIG = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  aiApiKey: process.env.AI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'heuristic', // 'gemini' | 'openai' | 'heuristic'
  authSecret: process.env.AUTH_SECRET || 'website-doctor-super-secret-key-change-in-production',
  defaultCheckTimeoutMs: 10000,
  maxRedirects: 5,
  maxContentLengthBytes: 5 * 1024 * 1024, // 5MB max payload to inspect
  crawlerMaxLinks: 60,
  workerIntervalMs: 15000, // Background worker checks every 15s
};
