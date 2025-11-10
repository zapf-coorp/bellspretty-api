#!/usr/bin/env ts-node
/*
  Seed runner script for roles.
  Usage (project root):
    npx ts-node scripts/seed-roles.ts
  or if you have ts-node installed globally:
    ts-node scripts/seed-roles.ts

  The script imports the project's DataSource from `src/config/database.config` so it uses the same connection options
  (supports both sqlite and postgres). It performs safe upserts per-dialect.
*/

import dataSource from '../src/config/database.config';

const ROLES = [
  { id: 'role-owner-uuid', name: 'owner', description: 'Salon owner with full access' },
  { id: 'role-admin-uuid', name: 'admin', description: 'Administrator with management access' },
  { id: 'role-worker-uuid', name: 'worker', description: 'Worker/Professional who provides services' },
  { id: 'role-client-uuid', name: 'client', description: 'Customer who books appointments' },
];

async function run() {
  try {
    console.log('Initializing DataSource...');
    if (!dataSource.isInitialized) await dataSource.initialize();

    const dbType = (dataSource.options as any).type;
    console.log('Connected DB type:', dbType);

    if (dbType === 'postgres' || dbType === 'postgresql') {
      for (const r of ROLES) {
        await dataSource.query(
          `INSERT INTO roles (id, name, description, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING`,
          [r.id, r.name, r.description],
        );
        console.log('Upserted role:', r.name);
      }
    } else if (dbType === 'sqlite' || dbType === 'sqljs' || dbType === 'better-sqlite3') {
      for (const r of ROLES) {
        await dataSource.query(
          `INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [r.id, r.name, r.description],
        );
        console.log('Inserted (or ignored if exists) role:', r.name);
      }
    } else {
      // Generic fallback using WHERE NOT EXISTS - should work on many SQL engines
      for (const r of ROLES) {
        await dataSource.query(
          `INSERT INTO roles (id, name, description, created_at)
           SELECT ?, ?, ?, CURRENT_TIMESTAMP
           WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = ?)`,
          [r.id, r.name, r.description, r.id],
        );
        console.log('Inserted (fallback) role:', r.name);
      }
    }

    console.log('Seeding complete.');
    await dataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    try {
      if (dataSource.isInitialized) await dataSource.destroy();
    } catch (e) {
      // ignore
    }
    process.exit(1);
  }
}

run();
