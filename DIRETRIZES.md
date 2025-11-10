# 📋 TODO List - Módulo de Mensageria

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
