#!/bin/bash

echo "🚀 Configurando o projeto BellsPretty API..."

# Copiar arquivo de ambiente se não existir
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env..."
  cp .env.example .env
  echo "✅ Arquivo .env criado! Por favor, configure suas variáveis de ambiente."
else
  echo "ℹ️ Arquivo .env já existe."
fi

# Instalar dependências se node_modules não existir
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
else
  echo "ℹ️ Dependências já instaladas."
fi

# Executar build
echo "🔨 Compilando projeto..."
npm run build

# Executar testes
echo "🧪 Executando testes..."
npm test

echo "✅ Configuração concluída!"
echo ""
echo "Para iniciar o servidor de desenvolvimento:"
echo "  npm run start:dev"
echo ""
echo "Para acessar a documentação:"
echo "  http://localhost:3000/api/docs"