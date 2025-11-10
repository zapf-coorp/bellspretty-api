# Configuração de Banco de Dados

A API BellsPretty está configurada para usar diferentes bancos de dados baseados no ambiente:

## 📚 Documentação Relacionada

| Documento | Descrição |
|-----------|-----------|
| **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** | 📊 Documentação visual completa do schema com diagramas ER, tabelas, relacionamentos e queries |
| **[docs/schema.sql](docs/schema.sql)** | 📄 Schema SQL completo para importação e referência |
| **[docs/README.md](docs/README.md)** | 📚 Índice da documentação técnica |

---

## 🗄️ Configuração por Ambiente

### **Desenvolvimento** (`NODE_ENV=development` ou não definido)
- **Banco**: SQLite
- **Localização**: `data/development.sqlite`
- **Configuração**: Automática via `synchronize: true`
- **Logs**: Queries visíveis no console

### **Teste** (`NODE_ENV=test`)
- **Banco**: SQLite em memória (`:memory:`)
- **Configuração**: Recriado a cada execução
- **Schema**: Sincronizado automaticamente
- **Logs**: Desabilitados

### **Produção** (`NODE_ENV=production`)
- **Banco**: PostgreSQL
- **Configuração**: Via migrações (`migrationsRun: true`)
- **SSL**: Configurável via `DB_SSL`
- **Schema**: Controlado via migrações (nunca `synchronize`)

## 📁 Estrutura de Arquivos

```
data/
├── development.sqlite    # Banco SQLite para desenvolvimento
└── README.md            # Este arquivo

src/
├── config/
│   └── database.config.ts    # Configuração multi-ambiente
├── entities/
│   └── user.entity.ts        # Entidade exemplo
└── migrations/              # Migrações para produção
```

## 🔧 Configuração de Ambiente

### Desenvolvimento (SQLite)
```env
NODE_ENV=development
DB_DATABASE=data/development.sqlite
```

### Produção (PostgreSQL)
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=senha_segura
DB_DATABASE=bellspretty_prod
DB_SSL=true
```

## 📊 Scripts Disponíveis

```bash
# Migrações
npm run migration:generate -- --name=CreateUsers
npm run migration:create -- --name=AddIndexes
npm run migration:run
npm run migration:revert

# Schema (apenas desenvolvimento)
npm run schema:sync
npm run schema:drop

# TypeORM CLI
npm run typeorm -- --help
```

## 🔍 Monitoramento

O endpoint `/api/health` fornece informações sobre:
- Status da conexão
- Tipo de banco configurado
- Nome do banco/arquivo
- Número de migrações
- Status da inicialização

## 🚀 Deploy em Produção

1. **Configure as variáveis de ambiente PostgreSQL**
2. **Execute as migrações**: `npm run migration:run`
3. **Inicie a aplicação**: `npm run start:prod`

## 🛠️ Troubleshooting

### SQLite não está criando o banco
- Verifique se o diretório `data/` existe
- Confirme as permissões de escrita
- Verifique a variável `DB_DATABASE`

### PostgreSQL não conecta
- Confirme as credenciais de acesso
- Verifique se o servidor PostgreSQL está rodando
- Teste a conectividade: `pg_isready -h host -p port`

### Migrações não executam
- Compile o projeto: `npm run build`
- Verifique se o banco está acessível
- Execute: `npm run migration:show` para listar migrações

## 📝 Exemplo de Uso

```typescript
// Em um service, injetando o DataSource
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class UserService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async findAll() {
    return this.dataSource.query('SELECT * FROM users');
  }
}
```