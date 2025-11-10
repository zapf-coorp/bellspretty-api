# Visualizar schema do banco SQLite
$dbPath = "data/development.sqlite"

if (Test-Path $dbPath) {
    Write-Host "`n📊 SQLITE DATABASE SCHEMA" -ForegroundColor Cyan
    Write-Host ("=" * 80) -ForegroundColor Gray
    
    # Listar todas as tabelas
    Write-Host "`n📋 TABLES:" -ForegroundColor Yellow
    sqlite3 $dbPath ".tables"
    
    # Schema de cada tabela
    Write-Host "`n📐 SCHEMA DETAILS:" -ForegroundColor Yellow
    Write-Host ("-" * 80) -ForegroundColor Gray
    
    $tables = sqlite3 $dbPath "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    
    foreach ($table in $tables) {
        Write-Host "`n🗂️  TABLE: $table" -ForegroundColor Green
        Write-Host ("-" * 80) -ForegroundColor Gray
        sqlite3 $dbPath ".schema $table"
        
        # Contar registros
        $count = sqlite3 $dbPath "SELECT COUNT(*) FROM $table;"
        Write-Host "`n   📊 Records: $count" -ForegroundColor Cyan
    }
    
    # Índices
    Write-Host "`n`n📇 INDEXES:" -ForegroundColor Yellow
    Write-Host ("-" * 80) -ForegroundColor Gray
    sqlite3 $dbPath "SELECT name, tbl_name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL;"
    
    Write-Host "`n" ("=" * 80) -ForegroundColor Gray
    Write-Host "✅ Schema visualization complete!`n" -ForegroundColor Green
} else {
    Write-Host "❌ Database file not found: $dbPath" -ForegroundColor Red
}
