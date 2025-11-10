# Migrações de Banco de Dados

Este diretório contém as migrações do TypeORM para controle de versão do schema do banco de dados.

## Comandos úteis:

```bash
# Gerar uma nova migração
npm run migration:generate -- --name=NomeDaMigracao

# Criar uma migração vazia
npm run migration:create -- --name=NomeDaMigracao

# Executar migrações pendentes
npm run migration:run

# Reverter última migração
npm run migration:revert

# Mostrar migrações
npm run migration:show
```

As migrações são aplicadas automaticamente em produção através da configuração `migrationsRun: true`.