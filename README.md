# BellsPretty API

Uma API RESTful construída com NestJS para o sistema BellsPretty.

## Características

- ✅ NestJS framework (v10)
- ✅ TypeScript
- ✅ Swagger/OpenAPI documentation
- ✅ Validation pipes com class-validator
- ✅ Configuration management
- ✅ CORS enabled
- ✅ Health check endpoints
- ✅ ESLint & Prettier configurados
- ✅ Jest para testes
- ✅ Estrutura preparada para TypeORM
- ✅ Multi-ambiente: SQLite (dev) + PostgreSQL (prod)
- ✅ Migrações configuradas
- ✅ Autenticação JWT + Refresh Tokens
- ✅ Sistema de registro e login
- ✅ Proteção de rotas com Guards
- ✅ Interfaces e DTOs padronizados

## Pré-requisitos

- Node.js (v16 ou superior)
- npm ou yarn
- PostgreSQL (para produção) - SQLite usado automaticamente em desenvolvimento

## Instalação Rápida

### Windows (PowerShell)
```powershell
.\setup.ps1
```

### Linux/Mac
```bash
chmod +x setup.sh
./setup.sh
```

### Manual

1. Clone o repositório:
```bash
git clone <repository-url>
cd bellspretty-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas configurações.

5. Compile e teste:
```bash
npm run build
npm test
```

## Scripts Disponíveis

```bash
# Desenvolvimento
npm run start:dev      # Inicia o servidor em modo watch

# Build
npm run build          # Compila o projeto

# Produção
npm run start:prod     # Inicia o servidor em produção

# Testes
npm run test           # Executa testes unitários
npm run test:watch     # Executa testes em modo watch
npm run test:cov       # Executa testes com coverage
npm run test:e2e       # Executa testes e2e

# Banco de dados
npm run migration:generate -- --name=CreateUsers  # Gera migração
npm run migration:run                             # Executa migrações
npm run migration:revert                          # Desfaz última migração

# Qualidade de código
npm run lint           # Executa ESLint
npm run format         # Formata código com Prettier
```

## Endpoints Disponíveis

### Health Check
- `GET /api` - Mensagem de boas-vindas
- `GET /api/health` - Status detalhado da aplicação e banco de dados

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/refresh` - Renovar access token
- `POST /api/auth/logout` - Logout específico
- `POST /api/auth/logout-all` - Logout em todos os dispositivos
- `GET /api/auth/profile` - Perfil do usuário autenticado

### Documentação
- `GET /api/docs` - Interface Swagger UI

## Estrutura do Projeto

```
src/
├── auth/                      # Módulo de autenticação
│   ├── dto/                   # DTOs de autenticação
│   ├── guards/                # Guards JWT e Local
│   ├── strategies/            # Estratégias Passport
│   ├── auth.controller.ts     # Endpoints de auth
│   ├── auth.service.ts        # Lógica de autenticação
│   └── auth.module.ts         # Módulo de auth
├── common/                    # Arquivos compartilhados
│   ├── decorators/            # Decorators customizados
│   ├── dto/                   # Data Transfer Objects
│   │   └── pagination.dto.ts  # DTO para paginação
│   └── interfaces/            # Interfaces TypeScript
│       └── api-response.interface.ts
├── config/                    # Configurações
│   ├── app.config.ts         # Configuração da aplicação
│   └── database.config.ts    # Configuração multi-ambiente do banco
├── entities/                  # Entidades TypeORM
│   ├── user.entity.ts        # Entidade de usuário
│   └── refresh-token.entity.ts # Entidade de refresh tokens
├── migrations/               # Migrações do banco (produção)
├── main.ts                   # Ponto de entrada
├── app.module.ts            # Módulo principal
├── app.controller.ts        # Controller principal
├── app.service.ts           # Service principal
└── app.service.spec.ts      # Testes unitários

data/                        # Banco SQLite (desenvolvimento)
├── development.sqlite       # Arquivo SQLite criado automaticamente
└── README.md

test/                        # Testes e2e
├── app.e2e-spec.ts
└── jest-e2e.json
```

## Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Desenvolvimento (SQLite - automático)
NODE_ENV=development
PORT=3000
DB_DATABASE=data/development.sqlite

# Produção (PostgreSQL)
NODE_ENV=production
PORT=3000
DB_HOST=your-postgres-host
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-secure-password
DB_DATABASE=bellspretty_prod
DB_SSL=true

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## Desenvolvimento

### Iniciando o servidor
```bash
npm run start:dev
```

A aplicação estará disponível em `http://localhost:3000`.
A documentação Swagger estará em `http://localhost:3000/api/docs`.

### Executando testes
```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:cov

# Testes e2e
npm run test:e2e
```

### Padrões do projeto

- **Controllers**: Responsáveis por receber requests e retornar responses
- **Services**: Contêm a lógica de negócio
- **DTOs**: Validação e transformação de dados de entrada
- **Interfaces**: Tipagem de responses e contratos
- **Modules**: Organização e injeção de dependências

## Próximos Passos

1. **Sistema de autenticação está pronto!** ✅
   - JWT com access e refresh tokens
   - Registro e login de usuários
   - Proteção de rotas implementada
   - Logout individual e global

2. **Banco de dados está configurado!** ✅
   - SQLite configurado para desenvolvimento
   - PostgreSQL configurado para produção
   - Entidades `User` e `RefreshToken` implementadas

3. **Próximas funcionalidades**:
   ```bash
   # Criar novos módulos
   nest generate module products
   nest generate module orders
   ```

4. **Melhorias futuras**:
   - Rate limiting para endpoints de auth
   - Recuperação de senha por email
   - Autenticação 2FA
   - Auditoria de login
   - Middleware de logging personalizado

## 🔐 Autenticação

A aplicação implementa um **sistema completo de autenticação**:
- **Access Tokens**: JWT de curta duração (15 min)
- **Refresh Tokens**: Tokens de longa duração (7 dias)
- **Múltiplos Dispositivos**: Logout específico ou global
- **Segurança**: Hash bcrypt, validação de entrada

Veja [AUTHENTICATION.md](AUTHENTICATION.md) para o guia completo de autenticação.

## 📊 Banco de Dados

A aplicação usa **configuração multi-ambiente**:
- **Desenvolvimento**: SQLite (`data/development.sqlite`)
- **Teste**: SQLite em memória
- **Produção**: PostgreSQL

Veja [DATABASE.md](DATABASE.md) para detalhes completos sobre configuração do banco.

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença [UNLICENSED].