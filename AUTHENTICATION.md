# Sistema de Autenticação JWT

Sistema completo de autenticação com JWT e refresh tokens implementado na API BellsPretty.

## 🔐 Características

- **JWT Access Tokens**: Tokens de curta duração (15 minutos)
- **Refresh Tokens**: Tokens de longa duração (7 dias) para renovação
- **Hash de Senha**: bcrypt com salt rounds 10
- **Proteção de Rotas**: Guards JWT e Local
- **Múltiplos Dispositivos**: Suporte a logout específico ou global
- **Validação**: DTOs com class-validator
- **Documentação**: Swagger/OpenAPI completa

## 📋 Endpoints Disponíveis

### Públicos (Não requerem autenticação)

#### `POST /api/auth/register`
Registra um novo usuário no sistema.

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@exemplo.com"
  }
}
```

#### `POST /api/auth/login`
Autentica um usuário existente.

**Body:**
```json
{
  "email": "joao@exemplo.com",
  "password": "minhasenha123"
}
```

**Response:** Mesmo formato do register

#### `POST /api/auth/refresh`
Renova o access token usando um refresh token válido.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** Novos tokens gerados

### Protegidos (Requerem Bearer Token)

#### `GET /api/auth/profile`
Retorna informações do usuário autenticado.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "uuid-do-usuario",
  "name": "João Silva",
  "email": "joao@exemplo.com"
}
```

#### `POST /api/auth/logout`
Revoga um refresh token específico.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `POST /api/auth/logout-all`
Revoga todos os refresh tokens do usuário (logout em todos os dispositivos).

## 🔧 Configuração

### Variáveis de Ambiente

```env
# JWT Secret - Use uma chave forte em produção
JWT_SECRET=seu-jwt-secret-super-seguro-aqui

# Duração dos tokens (configurável no código)
# Access Token: 15m (15 minutos)
# Refresh Token: 7d (7 dias)
```

### Estrutura do Banco

#### Tabela `users`
```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- Hash bcrypt
  isActive BOOLEAN DEFAULT true,
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL
);
```

#### Tabela `refresh_tokens`
```sql
CREATE TABLE refresh_tokens (
  id VARCHAR PRIMARY KEY,
  token VARCHAR NOT NULL,
  userId VARCHAR NOT NULL,
  expiresAt DATETIME NOT NULL,
  isRevoked BOOLEAN DEFAULT false,
  createdAt DATETIME NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🛡️ Segurança

### Hash de Senhas
- **Algoritmo**: bcrypt
- **Salt Rounds**: 10
- **Armazenamento**: Apenas hash, senha original nunca salva

### JWT Tokens
- **Access Token**: 15 minutos de validade
- **Refresh Token**: 7 dias de validade
- **Secret**: Configurável via ENV (JWT_SECRET)
- **Payload**: { email, sub: userId }

### Proteção contra Ataques
- **Validação de Entrada**: DTOs com class-validator
- **Rate Limiting**: Implementar externamente (nginx, etc.)
- **HTTPS Only**: Configurar no proxy reverso
- **Token Revogação**: Sistema de refresh token com revogação

## 🚀 Como Usar

### 1. Registro de Usuário
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'minhasenha123'
  })
});

const { accessToken, refreshToken, user } = await response.json();
```

### 2. Login
```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'joao@exemplo.com',
    password: 'minhasenha123'
  })
});

const { accessToken, refreshToken } = await response.json();
```

### 3. Acessar Rotas Protegidas
```javascript
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const userProfile = await response.json();
```

### 4. Renovar Token
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

const { accessToken: newAccessToken, refreshToken: newRefreshToken } = await response.json();
```

### 5. Logout
```javascript
// Logout específico
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

// Logout em todos os dispositivos
await fetch('/api/auth/logout-all', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

## 🔍 Códigos de Status HTTP

| Status | Descrição |
|--------|-----------|
| 200 | Login/refresh/logout bem-sucedido |
| 201 | Usuário registrado com sucesso |
| 400 | Dados de entrada inválidos |
| 401 | Token inválido ou expirado |
| 409 | Email já está em uso (registro) |
| 500 | Erro interno do servidor |

## 🧪 Testando a API

### Usando cURL

```bash
# Registro
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Teste","email":"teste@exemplo.com","password":"senha123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'

# Perfil (substitua TOKEN pelo access token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Usando Swagger UI

Acesse `http://localhost:3000/api/docs` para uma interface interativa da API.

## ⚠️ Considerações de Produção

1. **JWT_SECRET**: Use uma chave forte e única
2. **HTTPS**: Sempre use HTTPS em produção
3. **Rate Limiting**: Implemente proteção contra força bruta
4. **Logs**: Monitore tentativas de login suspeitas
5. **Backup**: Faça backup dos refresh tokens ativos
6. **Limpeza**: Limpe tokens expirados regularmente

## 🔧 Extensões Futuras

- [ ] Autenticação 2FA (Two-Factor Authentication)
- [ ] Login social (Google, Facebook, etc.)
- [ ] Rate limiting por IP
- [ ] Auditoria de login
- [ ] Política de senhas personalizável
- [ ] Recuperação de senha por email
- [ ] Bloqueio de conta após tentativas falhadas