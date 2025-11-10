# 📚 Documentação - BellsPretty API

Este diretório contém toda a documentação técnica complementar do projeto.

## 📄 Arquivos Disponíveis

### Schema do Banco de Dados

#### **[schema_v2.sql](schema_v2.sql)** ⭐ NOVO - Versão 2.0
- **Schema SQL completo** do sistema multi-tenant
- 11 tabelas: users, roles, salons, user_salon_roles, services, products, appointments, appointment_services, appointment_products, messages, refresh_tokens
- Índices otimizados e relacionamentos
- Triggers automáticos
- Views úteis
- Queries de exemplo

#### **[SCHEMA_GUIDE.md](SCHEMA_GUIDE.md)** ⭐ NOVO - Guia Visual
- Guia visual simplificado do schema
- Diagramas de fluxo de dados
- Casos de uso práticos
- Queries mais comuns
- Hierarquia de permissões (RBAC)

#### [schema.sql](schema.sql) - Versão 1.0 (Legado)
- Schema original (apenas users e refresh_tokens)
- Mantido para referência

**Uso:**
```bash
# Importar novo schema no SQLite
sqlite3 data/development.sqlite < docs/schema_v2.sql

# Importar schema no PostgreSQL
psql -U postgres -d bellspretty_prod < docs/schema_v2.sql
```

## 🔗 Documentação Relacionada

| Arquivo | Descrição |
|---------|-----------|
| [`../DATABASE_SCHEMA_NEW.md`](../DATABASE_SCHEMA_NEW.md) | 📊 Documentação completa v2.0 com diagramas ER detalhados |
| [`../DATABASE.md`](../DATABASE.md) | 🔧 Configuração de banco de dados e ambientes |
| [`../AUTHENTICATION.md`](../AUTHENTICATION.md) | 🔐 Documentação do sistema de autenticação |
| [`../DIRETRIZES.md`](../DIRETRIZES.md) | 📋 TODO list e diretrizes do projeto |
| [`../README.md`](../README.md) | 📖 Documentação geral do projeto |

## 🆕 O que mudou na v2.0?

### Novas Tabelas (9 tabelas adicionadas)
1. **roles** - Papéis do sistema (owner, admin, worker, client)
2. **salons** - Salões de beleza (multi-tenant)
3. **user_salon_roles** - Relacionamento user-salon-role (RBAC)
4. **services** - Serviços oferecidos por cada salão
5. **products** - Produtos vendidos/usados
6. **appointments** - Agendamentos de serviços
7. **appointment_services** - Serviços incluídos em agendamentos
8. **appointment_products** - Produtos usados em agendamentos
9. **messages** - Histórico de mensagens (WhatsApp, Email, SMS, Messenger)

### Tabelas Atualizadas
- **users** - Adicionado `phone` e `global_role` (super_admin support)

### Funcionalidades
✅ Multi-tenancy (múltiplos salões)  
✅ RBAC (Role-Based Access Control)  
✅ Histórico completo de agendamentos  
✅ Gestão de serviços e produtos  
✅ Sistema de mensagens programáveis  
✅ Auditoria completa  

## 📊 Diagramas

Os diagramas do banco de dados estão disponíveis em formato Mermaid nos arquivos de documentação.

Para visualizar:
1. Abra o arquivo no VS Code com preview de Markdown
2. Ou acesse via GitHub/GitLab (renderiza automaticamente)
3. Ou use https://mermaid.live para visualização online

## 🔧 Ferramentas Úteis

```bash
# Ver estrutura do schema atual
npm run typeorm schema:log

# Visualizar schema completo
npm run schema:show

# Visualização rápida SQLite
npm run db:show

# Gerar migration
npm run migration:generate -- --name=DescricaoDaMudanca
```

## 📝 Contribuindo

Ao adicionar novas tabelas ou modificar o schema:

1. Atualize o arquivo `schema_v2.sql`
2. Atualize o diagrama ER em `DATABASE_SCHEMA_NEW.md`
3. Atualize o guia visual em `SCHEMA_GUIDE.md`
4. Crie uma migration: `npm run migration:generate -- --name=DescricaoDaMudanca`
5. Documente as mudanças no changelog

## 🚀 Roadmap

### Próximas Implementações
- [ ] Tabela `message_templates` (templates reutilizáveis)
- [ ] Tabela `salon_settings` (configurações por salão)
- [ ] Tabela `payment_history` (histórico de pagamentos)
- [ ] Tabela `reviews` (avaliações de clientes)
- [ ] Tabela `notifications` (notificações in-app)

---

**Última atualização:** 10/11/2025  
**Versão do Schema:** 2.0.0

