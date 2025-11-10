const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'development.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
});

console.log('\n📊 SQLITE DATABASE SCHEMA VISUALIZATION\n');
console.log('='.repeat(80));

// Obter schema de todas as tabelas
db.all(
  "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
  [],
  (err, tables) => {
    if (err) {
      console.error('❌ Error:', err.message);
      db.close();
      return;
    }

    console.log(`\n📋 Found ${tables.length} table(s):\n`);

    let processedTables = 0;

    tables.forEach((table) => {
      console.log(`\n🗂️  TABLE: ${table.name}`);
      console.log('-'.repeat(80));
      console.log('\n📐 CREATE STATEMENT:');
      console.log(formatSQL(table.sql));

      // Informações das colunas
      db.all(`PRAGMA table_info(${table.name})`, [], (err, columns) => {
        if (err) {
          console.error('Error getting columns:', err.message);
          return;
        }

        console.log('\n📝 COLUMNS:');
        console.log('-'.repeat(80));
        console.log(
          `${'#'.padEnd(5)}${'Name'.padEnd(20)}${'Type'.padEnd(15)}${'NotNull'.padEnd(10)}${'Default'.padEnd(20)}${'PK'.padEnd(5)}`
        );
        console.log('-'.repeat(80));

        columns.forEach((col) => {
          console.log(
            `${col.cid.toString().padEnd(5)}${col.name.padEnd(20)}${col.type.padEnd(
              15
            )}${(col.notnull ? 'YES' : 'NO').padEnd(10)}${(col.dflt_value || '-').toString().padEnd(20)}${col.pk ? '✓' : ''}`
          );
        });

        // Foreign keys
        db.all(`PRAGMA foreign_key_list(${table.name})`, [], (err, fks) => {
          if (err) {
            console.error('Error getting foreign keys:', err.message);
            return;
          }

          if (fks.length > 0) {
            console.log('\n🔗 FOREIGN KEYS:');
            console.log('-'.repeat(80));
            fks.forEach((fk) => {
              console.log(
                `  ${fk.from} → ${fk.table}(${fk.to}) [ON DELETE: ${fk.on_delete || 'NO ACTION'}, ON UPDATE: ${fk.on_update || 'NO ACTION'}]`
              );
            });
          }

          // Índices
          db.all(
            `SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='${table.name}' AND sql IS NOT NULL`,
            [],
            (err, indexes) => {
              if (err) {
                console.error('Error getting indexes:', err.message);
                return;
              }

              if (indexes.length > 0) {
                console.log('\n📇 INDEXES:');
                console.log('-'.repeat(80));
                indexes.forEach((idx) => {
                  console.log(`  ${idx.name}:`);
                  console.log(`    ${idx.sql}`);
                });
              }

              // Contar registros
              db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, result) => {
                if (err) {
                  console.error('Error counting records:', err.message);
                  return;
                }

                console.log(`\n📊 Total Records: ${result.count}`);
                console.log('\n' + '='.repeat(80));

                processedTables++;

                // Quando todas as tabelas forem processadas, mostrar resumo
                if (processedTables === tables.length) {
                  showSummary(tables);
                }
              });
            }
          );
        });
      });
    });

    if (tables.length === 0) {
      console.log('\n⚠️  No tables found in database\n');
      db.close();
    }
  }
);

function formatSQL(sql) {
  return sql
    .replace(/CREATE TABLE/gi, '\nCREATE TABLE')
    .replace(/\(/g, '(\n  ')
    .replace(/,/g, ',\n  ')
    .replace(/\)/g, '\n)')
    .trim();
}

function showSummary(tables) {
  console.log('\n\n📈 DATABASE SUMMARY');
  console.log('='.repeat(80));

  let totalRecords = 0;

  const countPromises = tables.map((table) => {
    return new Promise((resolve) => {
      db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, result) => {
        if (!err && result) {
          totalRecords += result.count;
          console.log(`  ${table.name.padEnd(30)} ${result.count.toString().padStart(10)} records`);
        }
        resolve();
      });
    });
  });

  Promise.all(countPromises).then(() => {
    console.log('-'.repeat(80));
    console.log(`  ${'TOTAL'.padEnd(30)} ${totalRecords.toString().padStart(10)} records`);
    console.log('='.repeat(80));
    console.log('\n✅ Schema visualization complete!\n');
    
    // Fechar o banco de forma segura
    setTimeout(() => {
      db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        }
        process.exit(0);
      });
    }, 100);
  });
}

// Remover o listener de exit que fecha o banco
// process.on('exit', () => {
//   db.close();
// });
