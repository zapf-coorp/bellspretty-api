# 📋 TODO List - Módulo de Mensageria

## 🧾 Schema: Users (Lista de Tarefas)

Checklist para definir e implementar o schema `users` de forma clara e implementável.

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `name` VARCHAR(100) NOT NULL
  - `email` VARCHAR(255) UNIQUE NOT NULL
  - `password` VARCHAR(255) NOT NULL (armazenar hashed)
  - `phone` VARCHAR(20) NULLABLE
  - `global_role` ENUM('super_admin','user') DEFAULT 'user'
  - `is_active` BOOLEAN DEFAULT TRUE
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints/Checks: email format, optional CHECK para `global_role`
- [ ] Índices: UNIQUE(email), INDEX(global_role), INDEX(is_active)
- [ ] Políticas de deleção: definir soft-delete via `is_active` ou `deleted_at` (recomendado soft-delete)

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/user.entity.ts` com colunas em snake_case e mapeamentos:
  - OneToMany -> `RefreshToken`
  - OneToMany -> `UserSalonRole`
  - OneToMany -> `Appointment` (client) e (worker)
  - OneToMany -> `Message` (recipient/sender se aplicável)
- [ ] Aplicar `@Index`, `@Unique` e `@BeforeInsert` para normalizações (ex.: lower(email))
- [ ] Não expor `password` em toJSON/serializers (use transformer/exclude)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateOrUpdateUsers` e revisar SQL
- [ ] Implementar up/down idempotentes
- [ ] Se migrando de schema antigo, criar migration para migração de dados (normalizar emails, preencher `global_role`)

### D. Seeds e Dados de Desenvolvimento
- [ ] Seed para roles (já presente) e seed para um `super_admin` (usar password hashed de dev)
- [ ] Adicionar `docs/seeds/seed_users.sql` ou `scripts/seed-users.ts` com dados de exemplo (idempotente)

### E. DTOs e Validações (class-validator)
- [ ] `src/modules/users/dto/register-user.dto.ts` — name, email, password (validations)
- [ ] `src/modules/users/dto/login.dto.ts` — email, password
- [ ] `src/modules/users/dto/update-user.dto.ts` — PartialType para campos editáveis
- [ ] `src/modules/users/dto/paginate-users.dto.ts` — page, limit, filters

### F. Service, Controller e Endpoints
- [ ] Criar `UsersModule`, `UsersService`, `UsersController` (se não existirem)
- [ ] Endpoints recomendados:
  - POST /api/auth/register — registrar
  - POST /api/auth/login — autenticar
  - GET  /api/auth/profile — obter perfil (auth)
  - GET  /api/users — listar (admin)
  - GET  /api/users/:id — detalhes (owner/admin)
  - PUT  /api/users/:id — atualizar (owner/admin)
  - PATCH /api/users/:id/deactivate — desativar (soft-delete)
  - DELETE /api/users/:id — remover permanentemente (restrito)
- [ ] Garantir que `password` nunca seja retornado

### G. Segurança e Operações Sensíveis
- [ ] Hash de senha com `bcrypt` (saltRounds >= 10) no serviço antes de persistir
- [ ] Rate-limit para endpoints sensíveis (login/register)
- [ ] Implementar lockout/monitoramento de tentativas de login
- [ ] Uso seguro de tokens (rotacionamento de refresh tokens já existente)

### H. Tests
- [ ] Unit tests para `UsersService` (criar, atualizar, autenticar, desativar)
- [ ] E2E tests para registro/login/profile
- [ ] Testar migrations up/down em SQLite em memória

### I. Documentação e Swagger
- [ ] Documentar DTOs e endpoints com `@ApiTags('Users')` e `@ApiOperation`
- [ ] Atualizar `DIRETRIZES.md` com links para migrations e seeds geradas

### J. Checklist de Aceitação
- [ ] Migration aplicada em dev sem erros
- [ ] Endpoints de autenticação funcionando com tokens e refresh
- [ ] Testes unitários e e2e para os fluxos críticos passando
- [ ] Documentação atualizada (README / DIRETRIZES)


## 🧾 Schema: Roles (Lista de Tarefas)

Checklist para definir e implementar o schema `roles` (papéis do sistema e integração RBAC).

### A. Design e Especificação
- [ ] Campos principais:
  - `id` UUID PK
  - `name` VARCHAR(50) UNIQUE NOT NULL (ex.: owner, admin, worker, client)
  - `description` TEXT NULLABLE
  - `scope` ENUM('global','salon') DEFAULT 'salon'  # indica se é um papel global ou específico de salão
  - `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- [ ] Constraints/checks: UNIQUE(name), optional CHECK para `scope`
- [ ] Índices: UNIQUE(name), INDEX(scope)

### B. TypeORM Entity + Mapping
- [ ] Criar/validar `src/entities/role.entity.ts` com colunas snake_case e relacionamentos:
  - OneToMany -> `UserSalonRole` (pivot)
  - (Opcional) ManyToMany -> `User` via pivot para consultas simplificadas
- [ ] Garantir serialização segura (não expor dados que não devam sair via API)

### C. Migrations
- [ ] Gerar migration: `npm run migration:generate -- --name=CreateOrUpdateRoles` e revisar SQL
- [ ] Implementar up/down idempotentes
- [ ] Se houver roles pré-existentes, criar migration para mapear/migrar valores antigos para o novo modelo

### D. Seeds e Dados de Desenvolvimento
- [ ] Seed idempotente para papéis padrão: `owner`, `admin`, `worker`, `client` (usar ON CONFLICT/INSERT OR IGNORE)
- [ ] Atualizar `docs/seeds/seed_roles.sql` e `scripts/seed-roles.ts` se necessário (IDs previsíveis para testes)

### E. Integração RBAC / Políticas
- [ ] Documentar distinção entre `global_role` em `users` (super_admin) e `roles` por salão
- [ ] Implementar helpers/utilitários: `hasGlobalRole(user, roles[])`, `hasSalonRole(user, salonId, roles[])`
- [ ] Atualizar Guards/Policies para usar a nova `roles` table + pivot `user_salon_roles`

### F. Endpoints e Administração
- [ ] Endpoints recomendados (protegidos por `super_admin` / admin):
  - GET  /api/roles — listar
  - POST /api/roles — criar
  - PUT  /api/roles/:id — atualizar
  - DELETE /api/roles/:id — remover (cautela)
  - (Admin UI/API) atribuir roles por salão via pivot endpoints (já previstos em user_salon_roles checklist)
- [ ] Validar que remoção de role com referências falhe / exija migração antes

### G. Segurança e Consistência
- [ ] Proteger operações destrutivas (remoção/alteração de roles críticos)
- [ ] Quando renomear roles, prover migration que atualize referências no pivot

### H. Tests
- [ ] Unit tests para `RoleService` (criar, listar, atualizar, remover)
- [ ] Integration tests para APIs administrativas e interação com `user_salon_roles`
- [ ] E2E tests cobrindo atribuição e verificação de permissões

### I. Documentação e Swagger
- [ ] Documentar endpoints em Swagger (`@ApiTags('Roles')`)
- [ ] Adicionar exemplos para: criação, atribuição, revogação e verificação de permissões

### J. Checklist de Aceitação
- [ ] Roles padrão seedadas e visíveis via API
- [ ] Atribuição/revocação via pivot funciona com checks de permissão
- [ ] Testes críticos verdes e documentação atualizada


## 🏗️ Fase 1: Estrutura Base (Fundação)

### 1. ✅ Estrutura do Módulo
- [ ] Criar pasta `src/messaging/`
- [ ] Criar subpastas: `interfaces/`, `adapters/`, `services/`, `controllers/`, `dto/`, `entities/`
- [ ] Criar `messaging.module.ts` com imports necessários

### 2. ✅ Interfaces dos Repository Adapters
- [ ] Criar `interfaces/IWhatsAppAdapter.ts` com métodos: `send()`, `getStatus()`, `validateCredentials()`
- [ ] Criar `interfaces/IEmailAdapter.ts` com métodos similares + suporte a anexos
- [ ] Criar `interfaces/ISmsAdapter.ts` com métodos básicos de envio
- [ ] Criar `interfaces/IMessengerAdapter.ts` com métodos do Facebook API
- [ ] Criar interface base `IMessageAdapter` com métodos comuns

### 3. ✅ DTOs e Validações
- [ ] Criar `dto/send-whatsapp.dto.ts` (to, message, mediaUrl?, mediaType?)
- [ ] Criar `dto/send-email.dto.ts` (to, subject, body, html?, attachments?)
- [ ] Criar `dto/send-sms.dto.ts` (to, message)
- [ ] Criar `dto/send-messenger.dto.ts` (recipientId, message, quickReplies?)
- [ ] Criar `dto/message-response.dto.ts` (id, status, timestamp, provider)

### 4. ✅ Entidades do Banco de Dados
- [ ] Criar `entities/message.entity.ts` (id, type, recipient, content, status, providerId, userId, createdAt)
- [ ] Criar `entities/message-log.entity.ts` (id, messageId, event, details, timestamp)
- [ ] Adicionar migrations com TypeORM

## 🔌 Fase 2: Implementação dos Adapters

### 5. 📱 WhatsApp Adapter (Z-API)
- [ ] Instalar dependência: `npm install axios`
- [ ] Criar `adapters/whatsapp/zapi-whatsapp.adapter.ts`
- [ ] Implementar método `send()` para texto
- [ ] Implementar envio de imagens
- [ ] Implementar envio de documentos
- [ ] Adicionar variáveis no `.env`: `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`
- [ ] Criar método `getStatus()` para verificar conexão

### 6. 📧 Email Adapter (Resend)
- [ ] Instalar: `npm install resend`
- [ ] Criar `adapters/email/resend-email.adapter.ts`
- [ ] Implementar envio de email simples
- [ ] Implementar suporte a HTML
- [ ] Implementar suporte a anexos
- [ ] Adicionar variável: `RESEND_API_KEY`

### 7. 💬 SMS Adapter (TotalVoice)
- [ ] Instalar: `npm install totalvoice-node` ou usar `axios`
- [ ] Criar `adapters/sms/totalvoice-sms.adapter.ts`
- [ ] Implementar envio básico de SMS
- [ ] Adicionar variáveis: `TOTALVOICE_ACCESS_TOKEN`

### 8. 📲 Messenger Adapter (Facebook Graph API)
- [ ] Instalar: `npm install axios`
- [ ] Criar `adapters/messenger/facebook-messenger.adapter.ts`
- [ ] Implementar envio de mensagem via Graph API
- [ ] Implementar suporte a quick replies e botões
- [ ] Adicionar variáveis: `FACEBOOK_PAGE_ACCESS_TOKEN`, `FACEBOOK_VERIFY_TOKEN`

## 🎯 Fase 3: Camada de Serviços

### 9. 🏭 Serviço Unificado de Mensageria
- [ ] Criar `messaging.service.ts`
- [ ] Implementar injeção de dependência para todos os adapters
- [ ] Criar factory pattern para selecionar adapter correto
- [ ] Implementar método `sendWhatsApp(dto)`
- [ ] Implementar método `sendEmail(dto)`
- [ ] Implementar método `sendSms(dto)`
- [ ] Implementar método `sendMessenger(dto)`
- [ ] Salvar todas as mensagens no banco de dados
- [ ] Adicionar logs com Winston/Pino

### 10. 🎮 Controller de Mensagens
- [ ] Criar `messaging.controller.ts`
- [ ] Criar endpoint `POST /api/messages/whatsapp` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/email` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/sms` (protegido com JWT)
- [ ] Criar endpoint `POST /api/messages/messenger` (protegido com JWT)
- [ ] Criar endpoint `GET /api/messages/history` (listagem com paginação)
- [ ] Criar endpoint `GET /api/messages/:id` (detalhes de uma mensagem)

## ⚡ Fase 4: Processamento Assíncrono

### 11. 🔄 Sistema de Filas (BullMQ + Redis)
- [ ] Instalar: `npm install @nestjs/bull bullmq ioredis`
- [ ] Configurar Redis (Docker ou local)
- [ ] Criar fila `whatsapp-queue`
- [ ] Criar fila `email-queue`
- [ ] Criar fila `sms-queue`
- [ ] Criar fila `messenger-queue`
- [ ] Criar processors para cada fila
- [ ] Implementar jobs com retry automático

### 12. 🛡️ Tratamento de Erros e Resiliência
- [ ] Implementar retry automático (3 tentativas)
- [ ] Implementar circuit breaker para APIs externas
- [ ] Criar logs detalhados de erros
- [ ] Implementar fallback para provedores alternativos
- [ ] Adicionar timeout nas requisições (30s)

## ✅ Fase 5: Testes

### 13. 🧪 Testes Unitários dos Adapters
- [ ] Testar `ZApiWhatsAppAdapter` com API mockada
- [ ] Testar `ResendEmailAdapter` com API mockada
- [ ] Testar `TotalVoiceSmsAdapter` com API mockada
- [ ] Testar `FacebookMessengerAdapter` com API mockada
- [ ] Testar validações dos DTOs

### 14. 🔬 Testes E2E
- [ ] Testar fluxo completo de envio via WhatsApp
- [ ] Testar fluxo completo de envio via Email
- [ ] Testar autenticação nos endpoints
- [ ] Testar cenários de erro (credenciais inválidas, timeout, etc)

## 📚 Fase 6: Documentação e Features Extras

### 15. 📖 Documentação Swagger
- [ ] Adicionar `@ApiTags('Messaging')` no controller
- [ ] Documentar todos os endpoints com `@ApiOperation`
- [ ] Adicionar exemplos de request/response
- [ ] Documentar códigos de erro possíveis

### 16. 📝 Sistema de Templates
- [ ] Criar entidade `MessageTemplate`
- [ ] Permitir variáveis dinâmicas: `{{nome}}`, `{{data}}`, etc
- [ ] Criar endpoint para gerenciar templates
- [ ] Implementar parse de templates antes do envio

### 17. 🔔 Webhooks para Status de Entrega
- [ ] Criar endpoint `POST /api/webhooks/whatsapp/status`
- [ ] Criar endpoint `POST /api/webhooks/email/status`
- [ ] Atualizar status da mensagem no banco (entregue, lido, falhou)
- [ ] Registrar eventos no `MessageLog`

### 18. 🚦 Rate Limiting
- [ ] Instalar: `npm install @nestjs/throttler`
- [ ] Configurar limite por usuário (ex: 100 msg/hora)
- [ ] Configurar limite global (ex: 1000 msg/hora)
- [ ] Criar sistema de cotas por plano de usuário

### 19. 📊 Dashboard de Estatísticas
- [ ] Criar endpoint `GET /api/messages/stats`
- [ ] Retornar: total enviado, taxa de sucesso, falhas
- [ ] Agrupar por canal (WhatsApp, Email, SMS, Messenger)
- [ ] Adicionar filtros por período (hoje, semana, mês)
- [ ] Calcular custos estimados por canal

### 20. 📄 Documentação Final
- [ ] Criar `MESSAGING.md` com guia completo
- [ ] Documentar como trocar de provedor
- [ ] Adicionar exemplos de uso de cada adapter
- [ ] Documentar variáveis de ambiente necessárias
- [ ] Criar guia de troubleshooting

---


## 🎯 Prioridade de Execução Sugerida:

1. **CRÍTICO** (Fazer primeiro): Fases 1, 2, 3
2. **IMPORTANTE**: Fases 4, 5
3. **DESEJÁVEL**: Fase 6

## 🛠️ Dependências Necessárias:

```bash
# Instalar todas de uma vez
npm install axios resend ioredis @nestjs/bull bullmq @nestjs/throttler
```

## 📐 Arquitetura de Repository Adapter - Benefícios:

✅ **Desacoplamento**: Troca de provedor sem alterar lógica de negócio  
✅ **Testabilidade**: Fácil criar mocks dos adapters  
✅ **Escalabilidade**: Adicionar novos canais sem modificar código existente  
✅ **Manutenibilidade**: Cada adapter é independente  
✅ **Flexibilidade**: Usar múltiplos provedores simultaneamente (fallback)

---

# Endpoints Disponíveis

## 🏠 Endpoints Principais
| Método | Endpoint            | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|---------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| GET    | /api                | Status básico da API                   | Nenhum                                       | String: "Hello World!"                      |
| GET    | /api/health         | Health check com status do banco      | Nenhum                                       | JSON: { status, uptime, database }          |

## 🔐 Endpoints de Autenticação
| Método | Endpoint               | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|------------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| POST   | /api/auth/register     | Registrar novo usuário                 | JSON: { "name", "email", "password" }        | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/login        | Fazer login                            | JSON: { "email", "password" }                | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/refresh      | Renovar access token                   | JSON: { "refreshToken" }                     | JSON: { user, accessToken, refreshToken }   |
| POST   | /api/auth/logout       | Logout (revoga refresh token)         | JSON: { "refreshToken" } + Authorization     | Status: 200                                 |
| POST   | /api/auth/logout-all   | Logout de todos os dispositivos        | Authorization Header                         | Status: 200                                 |
| GET    | /api/auth/profile      | Obter perfil do usuário               | Authorization Header                         | JSON: { id, name, email, createdAt }       |

## 📚 Documentação
| Método | Endpoint            | Descrição Breve                         | Recebe (Body/Params)                          | Devolve (Response)                           |
|--------|---------------------|----------------------------------------|----------------------------------------------|---------------------------------------------|
| GET    | /api/docs           | Documentação Swagger/OpenAPI           | Nenhum                                       | Interface Swagger                           |

## 🔑 Autenticação - Como Usar

### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "João Silva", "email": "joao@email.com", "password": "minhasenha123"}'
```

### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "joao@email.com", "password": "minhasenha123"}'
```

### 3. Acessar Endpoints Protegidos
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN_AQUI"
```

### 4. Renovar Token
```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "SEU_REFRESH_TOKEN_AQUI"}'
```

## ⚠️ Observações Importantes

- **Access Token**: Válido por 15 minutos
- **Refresh Token**: Válido por 7 dias  
- **Banco de Dados**: SQLite em desenvolvimento, PostgreSQL em produção
- **Senha**: Criptografada com bcrypt
- **Documentação Completa**: Disponível em `/api/docs` (Swagger)

# 🧰 Ferramentas e Tecnologias Implementadas

## 🏗️ Stack Atual
| Tecnologia         | Versão/Tipo              | Finalidade                             |
| ------------------ | ------------------------ | -------------------------------------- |
| **NestJS**         | v10                      | Framework backend principal            |
| **TypeScript**     | v5                       | Tipagem estática                       |
| **TypeORM**        | v0.3                     | ORM para banco de dados                |
| **SQLite**         | Local                    | Banco de desenvolvimento               |
| **PostgreSQL**     | Configurado              | Banco de produção                      |
| **JWT**            | Access + Refresh Tokens  | Sistema de autenticação                |
| **bcrypt**         | Hash                     | Criptografia de senhas                 |
| **Jest**           | Testes                   | Framework de testes                    |
| **Swagger**        | OpenAPI                  | Documentação automática                |

## 🚀 Ferramentas Recomendadas para Deploy

| Função          | Serviço                  | Observação                         |
| --------------- | ------------------------ | ---------------------------------- |
| Banco de Dados  | **Supabase / Neon.tech** | PostgreSQL grátis e confiável      |
| Deploy          | **Render / Railway.app** | Deploy backend gratuito            |
| Envios WhatsApp | **Z-API**                | Para implementação futura          |
| Envios E-mail   | **Resend / Brevo**       | Para implementação futura          |
| SMS             | **TotalVoice**           | Para implementação futura          |
| Mensageria      | **BullMQ + Redis**       | Para filas (implementação futura)  |
| Monitoramento   | **UptimeRobot**          | Verifica se a API está online      |

## 📊 Status do Projeto

### ✅ Implementado e Funcionando
- [x] Sistema de autenticação completo (JWT + Refresh Token)
- [x] Banco de dados multi-ambiente (SQLite + PostgreSQL)
- [x] Documentação automática (Swagger)
- [x] Testes unitários e e2e (21 testes passando)
- [x] Validação de dados de entrada
- [x] Proteção de rotas
- [x] Health checks

### 🚧 Próximos Passos Sugeridos
- [ ] Sistema de envio de WhatsApp
- [ ] Sistema de envio de E-mail
- [ ] Sistema de envio de SMS
- [ ] Rate limiting para APIs
- [ ] Logs estruturados
- [ ] Recuperação de senha
- [ ] Two-Factor Authentication (2FA)
- [ ] Módulos de negócio específicos

### 🏃‍♂️ Como Executar

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod

# Testes
npm test                # Testes unitários
npm run test:e2e        # Testes end-to-end
npm run test:cov        # Cobertura de testes
```

**🌐 Servidor Local**: http://localhost:3000  
**📖 Documentação**: http://localhost:3000/api/docs
