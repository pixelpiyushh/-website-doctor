import pg from 'pg';
import path from 'path';
import fs from 'fs';
import { CONFIG } from '../config.js';

export interface DBClient {
  query: (text: string, params?: any[]) => Promise<{ rows: any[]; rowCount: number }>;
  exec: (sql: string) => Promise<void>;
}

let dbInstance: DBClient | null = null;

export async function getDB(): Promise<DBClient> {
  if (dbInstance) return dbInstance;

  // 1. External PostgreSQL (via DATABASE_URL, e.g. Supabase, Neon, Render Postgres)
  if (CONFIG.databaseUrl) {
    try {
      console.log('Connecting to PostgreSQL database via DATABASE_URL...');
      const pool = new pg.Pool({ connectionString: CONFIG.databaseUrl });
      await pool.query('SELECT 1');
      console.log('Successfully connected to external PostgreSQL database.');
      dbInstance = {
        query: async (text: string, params?: any[]) => {
          const res = await pool.query(text, params);
          return { rows: res.rows, rowCount: res.rowCount || 0 };
        },
        exec: async (sql: string) => {
          await pool.query(sql);
        },
      };
      await initSchema(dbInstance);
      return dbInstance;
    } catch (err: any) {
      console.warn(`Could not connect to external PostgreSQL (${err.message}). Falling back to embedded engine.`);
    }
  }

  // 2. Ultra-lightweight Embedded Database (Node.js native SQLite - uses <10MB RAM, zero WASM bloat)
  console.log('Initializing lightweight embedded database engine (native SQLite)...');
  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbFile = path.join(dataDir, 'website_doctor.db');
  const { DatabaseSync } = await import('node:sqlite');
  const sqlite = new DatabaseSync(dbFile);
  console.log('Lightweight embedded database ready with persistent storage at:', dbFile);

  dbInstance = {
    query: async (text: string, params?: any[]) => {
      // Map PostgreSQL parameter syntax ($1, $2) to SQLite syntax (?1, ?2)
      const sqliteText = text.replace(/\$(\d+)/g, '?$1');
      const isRead = /^\s*(SELECT|PRAGMA)/i.test(sqliteText) || /RETURNING/i.test(sqliteText);
      const stmt = sqlite.prepare(sqliteText);

      // Normalize parameters (boolean to 1/0, undefined to null)
      const cleanParams = (params || []).map((p) => {
        if (typeof p === 'boolean') return p ? 1 : 0;
        if (p === undefined) return null;
        return p;
      });

      if (isRead) {
        const rawRows = cleanParams.length ? stmt.all(...cleanParams) : stmt.all();
        const rows = (rawRows as any[]).map((row) => ({ ...row }));
        return { rows, rowCount: rows.length };
      } else {
        const info = cleanParams.length ? stmt.run(...cleanParams) : stmt.run();
        return { rows: [], rowCount: Number(info.changes) };
      }
    },
    exec: async (sql: string) => {
      sqlite.exec(sql);
    },
  };

  await initSchema(dbInstance);
  return dbInstance;
}

async function initSchema(db: DBClient) {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS websites (
      id TEXT PRIMARY KEY,
      url TEXT UNIQUE NOT NULL,
      hostname TEXT NOT NULL,
      title TEXT,
      status TEXT DEFAULT 'operational',
      last_checked_at TIMESTAMPTZ,
      health_score INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monitors (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      interval_seconds INTEGER DEFAULT 60,
      timeout_ms INTEGER DEFAULT 10000,
      http_method TEXT DEFAULT 'GET',
      expected_status_code INTEGER DEFAULT 200,
      keyword_match TEXT,
      status TEXT DEFAULT 'operational', -- 'operational', 'degraded', 'down', 'paused'
      consecutive_failures INTEGER DEFAULT 0,
      last_checked_at TIMESTAMPTZ,
      uptime_pct NUMERIC(5, 2) DEFAULT 100.0,
      is_demo BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS monitor_checks (
      id TEXT PRIMARY KEY,
      monitor_id TEXT REFERENCES monitors(id) ON DELETE CASCADE,
      status_code INTEGER NOT NULL,
      status_message TEXT,
      response_time_ms INTEGER NOT NULL,
      ttfb_ms INTEGER NOT NULL,
      is_online BOOLEAN NOT NULL,
      error TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      monitor_id TEXT REFERENCES monitors(id) ON DELETE CASCADE,
      website_url TEXT NOT NULL,
      title TEXT NOT NULL,
      cause TEXT NOT NULL,
      status TEXT DEFAULT 'active', -- 'active', 'resolved'
      severity TEXT DEFAULT 'critical', -- 'critical', 'warning'
      started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      resolved_at TIMESTAMPTZ,
      duration_seconds INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS incident_events (
      id TEXT PRIMARY KEY,
      incident_id TEXT REFERENCES incidents(id) ON DELETE CASCADE,
      timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alert_rules (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      threshold NUMERIC,
      enabled BOOLEAN DEFAULT TRUE,
      channel TEXT DEFAULT 'in_app',
      recipient TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alert_events (
      id TEXT PRIMARY KEY,
      rule_id TEXT REFERENCES alert_rules(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      website_url TEXT NOT NULL,
      severity TEXT DEFAULT 'critical',
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ssl_checks (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      has_ssl BOOLEAN NOT NULL,
      status TEXT NOT NULL,
      status_text TEXT NOT NULL,
      issuer TEXT,
      subject TEXT,
      valid_from TEXT,
      valid_to TEXT,
      days_remaining INTEGER,
      protocol TEXT,
      cipher_name TEXT,
      http_to_https_redirect BOOLEAN,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS security_checks (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      present_count INTEGER NOT NULL,
      total_evaluated INTEGER NOT NULL,
      headers_json TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS performance_checks (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      response_time_ms INTEGER NOT NULL,
      ttfb_ms INTEGER NOT NULL,
      dns_time_ms INTEGER NOT NULL,
      tcp_time_ms INTEGER NOT NULL,
      tls_time_ms INTEGER NOT NULL,
      content_length INTEGER,
      content_encoding TEXT,
      cache_control TEXT,
      redirect_count INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS seo_checks (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      title TEXT,
      meta_description TEXT,
      canonical_url TEXT,
      robots_meta TEXT,
      viewport TEXT,
      h1_count INTEGER,
      images_total INTEGER,
      images_missing_alt INTEGER,
      has_open_graph BOOLEAN,
      has_sitemap BOOLEAN,
      has_robots_txt BOOLEAN,
      issues_json TEXT,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS broken_links (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      status_code INTEGER,
      status TEXT NOT NULL,
      link_type TEXT NOT NULL,
      source_page TEXT NOT NULL,
      anchor_text TEXT,
      response_time_ms INTEGER,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_analyses (
      id TEXT PRIMARY KEY,
      website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
      headline TEXT NOT NULL,
      clinical_assessment TEXT NOT NULL,
      problems_json TEXT NOT NULL,
      actions_json TEXT NOT NULL,
      generated_by TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_monitors_website_id ON monitors(website_id);
    CREATE INDEX IF NOT EXISTS idx_monitor_checks_monitor_id ON monitor_checks(monitor_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_incidents_monitor_id ON incidents(monitor_id, status);
    CREATE INDEX IF NOT EXISTS idx_alert_events_created ON alert_events(created_at DESC);
  `;

  try {
    await db.exec(schemaSQL);
    console.log('Database schema successfully verified and indexed.');
  } catch (err: any) {
    console.error('Error initializing database schema:', err.message);
  }
}
