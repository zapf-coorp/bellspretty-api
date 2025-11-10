
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

