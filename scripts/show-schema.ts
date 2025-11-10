import { DataSource } from 'typeorm';
import * as path from 'path';

// Importar configuração do banco
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

require('dotenv').config({ path: path.resolve(process.cwd(), envFile) });

// Configuração do DataSource
const AppDataSource = new DataSource({
  type: process.env.DB_TYPE === 'postgres' ? 'postgres' : 'sqlite',
  database: process.env.DB_DATABASE || 'data/development.sqlite',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
});

async function showSchema() {
  try {
    await AppDataSource.initialize();
    console.log('\n📊 DATABASE SCHEMA VISUALIZATION\n');
    console.log('='.repeat(80));
    
    // Obter todas as tabelas
    const queryRunner = AppDataSource.createQueryRunner();
    const tables = await queryRunner.getTables();
    
    for (const table of tables) {
      console.log(`\n📋 TABLE: ${table.name}`);
      console.log('-'.repeat(80));
      
      // Colunas
      console.log('\n  📝 COLUMNS:');
      console.log('  ' + '-'.repeat(76));
      console.log(`  ${'Column'.padEnd(20)} ${'Type'.padEnd(15)} ${'Nullable'.padEnd(10)} ${'Default'.padEnd(15)} ${'Extra'.padEnd(15)}`);
      console.log('  ' + '-'.repeat(76));
      
      for (const column of table.columns) {
        const colName = column.name.padEnd(20);
        const colType = column.type.padEnd(15);
        const nullable = (column.isNullable ? 'YES' : 'NO').padEnd(10);
        const defaultVal = (column.default || '-').toString().padEnd(15);
        const extra = [];
        
        if (column.isPrimary) extra.push('PK');
        if (column.isUnique) extra.push('UNIQUE');
        if (column.isGenerated) extra.push('AUTO');
        
        const extraStr = extra.join(', ').padEnd(15);
        
        console.log(`  ${colName} ${colType} ${nullable} ${defaultVal} ${extraStr}`);
      }
      
      // Foreign Keys
      if (table.foreignKeys.length > 0) {
        console.log('\n  🔗 FOREIGN KEYS:');
        console.log('  ' + '-'.repeat(76));
        for (const fk of table.foreignKeys) {
          console.log(`  ${fk.columnNames.join(', ')} → ${fk.referencedTableName}(${fk.referencedColumnNames.join(', ')})`);
          if (fk.onDelete) console.log(`    ON DELETE: ${fk.onDelete}`);
          if (fk.onUpdate) console.log(`    ON UPDATE: ${fk.onUpdate}`);
        }
      }
      
      // Índices
      if (table.indices.length > 0) {
        console.log('\n  📇 INDEXES:');
        console.log('  ' + '-'.repeat(76));
        for (const index of table.indices) {
          const unique = index.isUnique ? '(UNIQUE)' : '';
          console.log(`  ${index.name}: ${index.columnNames.join(', ')} ${unique}`);
        }
      }
      
      // Unique Constraints
      if (table.uniques.length > 0) {
        console.log('\n  ✨ UNIQUE CONSTRAINTS:');
        console.log('  ' + '-'.repeat(76));
        for (const unique of table.uniques) {
          console.log(`  ${unique.name}: ${unique.columnNames.join(', ')}`);
        }
      }
      
      console.log('\n' + '='.repeat(80));
    }
    
    // Estatísticas
    console.log('\n📊 STATISTICS:');
    console.log('-'.repeat(80));
    console.log(`Total Tables: ${tables.length}`);
    
    let totalColumns = 0;
    let totalFKs = 0;
    let totalIndexes = 0;
    
    for (const table of tables) {
      totalColumns += table.columns.length;
      totalFKs += table.foreignKeys.length;
      totalIndexes += table.indices.length;
    }
    
    console.log(`Total Columns: ${totalColumns}`);
    console.log(`Total Foreign Keys: ${totalFKs}`);
    console.log(`Total Indexes: ${totalIndexes}`);
    console.log('='.repeat(80));
    
    // Contar registros
    console.log('\n📈 RECORD COUNTS:');
    console.log('-'.repeat(80));
    
    for (const table of tables) {
      try {
        const result = await queryRunner.query(`SELECT COUNT(*) as count FROM ${table.name}`);
        const count = result[0].count || result[0].COUNT || 0;
        console.log(`${table.name.padEnd(30)} ${count} records`);
      } catch (error) {
        console.log(`${table.name.padEnd(30)} Error counting`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('\n✅ Schema visualization complete!\n');
    
    await queryRunner.release();
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showSchema();
