# 📚 Documentação - BellsPretty API

Este diretório contém toda a documentação técnica complementar do projeto.

## 📄 Arquivos Disponíveis

### [`schema.sql`](schema.sql)
- Schema SQL completo do banco de dados
- DDL de todas as tabelas (users, refresh_tokens)
- Índices e constraints
- Views úteis
- Queries de exemplo e manutenção
- Comentários detalhados

**Uso:**
```bash
# Importar schema no SQLite
sqlite3 data/development.sqlite < docs/schema.sql

# Importar schema no PostgreSQL
psql -U postgres -d bellspretty_prod < docs/schema.sql
```

## 🔗 Documentação Relacionada

| Arquivo | Descrição |
|---------|-----------|
| [`../DATABASE_SCHEMA.md`](../DATABASE_SCHEMA.md) | Documentação visual completa do schema com diagramas ER |
| [`../DATABASE.md`](../DATABASE.md) | Configuração de banco de dados e ambientes |
| [`../AUTHENTICATION.md`](../AUTHENTICATION.md) | Documentação do sistema de autenticação |
| [`../README.md`](../README.md) | Documentação geral do projeto |

## 📊 Diagramas

Os diagramas do banco de dados estão disponíveis em formato Mermaid no arquivo [`DATABASE_SCHEMA.md`](../DATABASE_SCHEMA.md).

Para visualizar:
1. Abra o arquivo no VS Code com preview de Markdown
2. Ou acesse via GitHub/GitLab (renderiza automaticamente)
3. Ou use https://mermaid.live para visualização online

## 🔧 Ferramentas Úteis

```bash
# Ver estrutura do schema atual
npm run typeorm schema:log

# Gerar documentação atualizada
npm run schema:docs

# Sincronizar schema (apenas dev)
npm run schema:sync
```

## 📝 Contribuindo

Ao adicionar novas tabelas ou modificar o schema:

1. Atualize o arquivo `schema.sql`
2. Atualize o diagrama ER em `DATABASE_SCHEMA.md`
3. Crie uma migration: `npm run migration:generate -- --name=DescricaoDaMudanca`
4. Documente as mudanças no changelog

---

**Última atualização:** 10/11/2025
