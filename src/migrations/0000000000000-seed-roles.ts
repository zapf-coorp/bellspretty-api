import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRoles0000000000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Detect DB type to issue dialect-appropriate INSERT (Postgres vs SQLite)
        const dbType = (queryRunner.connection.options as any).type;

        const rows = [
            "('role-owner-uuid', 'owner', 'Salon owner with full access', CURRENT_TIMESTAMP)",
            "('role-admin-uuid', 'admin', 'Administrator with management access', CURRENT_TIMESTAMP)",
            "('role-worker-uuid', 'worker', 'Worker/Professional who provides services', CURRENT_TIMESTAMP)",
            "('role-client-uuid', 'client', 'Customer who books appointments', CURRENT_TIMESTAMP)",
        ];

        if (dbType === 'postgres' || dbType === 'postgresql') {
            await queryRunner.query(`
                INSERT INTO roles (id, name, description, created_at) VALUES
                ${rows.join(',\n        ')}
                ON CONFLICT (id) DO NOTHING;
            `);
            return;
        }

        if (dbType === 'sqlite' || dbType === 'better-sqlite3' || dbType === 'sqljs') {
            // SQLite supports "INSERT OR IGNORE"
            await queryRunner.query(`
                INSERT OR IGNORE INTO roles (id, name, description, created_at) VALUES
                ${rows.join(',\n        ')};
            `);
            return;
        }

        // Fallback: run safe per-row upserts using 'WHERE NOT EXISTS' (widely supported)
        for (const r of rows) {
            // r contains (...) values; extract id and rest for a safer generic insert
            // We'll parse id from the string for the existence check
            const idMatch = /\('(.*?)',/.exec(r);
            const id = idMatch ? idMatch[1] : null;
            if (!id) continue;
            await queryRunner.query(`
                INSERT INTO roles (id, name, description, created_at)
                SELECT ${r}
                WHERE NOT EXISTS (SELECT 1 FROM roles WHERE id = '${id}');
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM roles WHERE id IN (
                'role-owner-uuid',
                'role-admin-uuid',
                'role-worker-uuid',
                'role-client-uuid'
            );
        `);
    }
}
