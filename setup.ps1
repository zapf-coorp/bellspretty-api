Write-Host "🚀 Configurando o projeto BellsPretty API..." -ForegroundColor Green

# Copiar arquivo de ambiente se não existir
if (!(Test-Path ".env")) {
    Write-Host "📝 Criando arquivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Arquivo .env criado! Por favor, configure suas variáveis de ambiente." -ForegroundColor Green
} else {
    Write-Host "ℹ️ Arquivo .env já existe." -ForegroundColor Blue
}

# Instalar dependências se node_modules não existir
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "ℹ️ Dependências já instaladas." -ForegroundColor Blue
}

# Executar build
Write-Host "🔨 Compilando projeto..." -ForegroundColor Yellow
npm run build

# Executar testes
Write-Host "🧪 Executando testes..." -ForegroundColor Yellow
npm test

Write-Host "✅ Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor de desenvolvimento:" -ForegroundColor Cyan
Write-Host "  npm run start:dev" -ForegroundColor White
Write-Host ""
Write-Host "Para acessar a documentação:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000/api/docs" -ForegroundColor White