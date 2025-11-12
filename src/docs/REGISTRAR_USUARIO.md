# Funcionalidade: Registro e Gestão de Usuários

Esta documentação descreve os processos para registrar novos usuários na plataforma, abrangendo tanto o auto-registro público quanto a criação e atribuição de papéis por usuários administrativos.

O sistema distingue entre a **criação de uma conta de usuário** (uma entidade global) e a **atribuição de um papel** (um contexto específico, geralmente dentro de um salão).

---

## Caso de Uso 1: Auto-Registro de Cliente (Público)

Qualquer visitante pode criar uma conta de usuário básica para interagir com a plataforma como cliente.

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Cria uma nova conta de usuário com o papel global de `user`. |

### Controle de Acesso
- **Endpoint Público**: Não requer autenticação.

### Processo
1.  O usuário envia `name`, `email` e `password`.
2.  O sistema cria um novo registro na tabela `users` com `global_role` definido como `'user'`.
3.  A senha é armazenada com hash (`bcrypt`).
4.  O e-mail deve ser único no sistema.
5.  Após o sucesso, a API retorna os dados do novo usuário e um par de tokens (`accessToken`, `refreshToken`) para login imediato.

### Request Body (`RegisterUserDto`)

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Sim | Nome completo do usuário. |
| `email` | `string` | Sim | Endereço de e-mail único. |
| `password` | `string` | Sim | Senha de acesso. |
| `phone` | `string` | Não | Telefone de contato. |

### Resposta de Sucesso (`201 Created`)

```json
{
  "user": {
    "id": "c4a2b1d0-1234-5678-9abc-def012345678",
    "name": "Maria da Silva",
    "email": "maria.silva@email.com",
    "global_role": "user",
    ...
  },
  "accessToken": "ey...",
  "refreshToken": "ey..."
}
```

---

## Casos de Uso 2, 3 e 4: Registro e Gestão Administrativa

Este fluxo é usado por administradores ou funcionários para registrar novos usuários (como clientes ou outros funcionários) e atribuir-lhes papéis específicos dentro de um salão.

O processo ocorre em duas etapas:

1.  **Criação da Conta**: A conta do usuário é criada no sistema.
2.  **Atribuição de Papel**: O usuário recém-criado recebe um papel (`role`) dentro de um salão (`salon`).

### Etapa 1 (Opção A): Usuário realiza o auto-registro

O método mais simples é instruir o novo funcionário ou cliente a se registrar através do endpoint público `POST /api/auth/register`, como descrito no Caso de Uso 1. Após o registro, um administrador pode prosseguir para a Etapa 2.

### Etapa 1 (Opção B): Criação por um Administrador

Um administrador com a permissão `users.create` pode criar uma conta de usuário diretamente, sem gerar uma sessão de login para si mesmo.

| Método | URL | Descrição | Permissão Necessária |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/users` | Cria uma conta de usuário básica. | `users.create` |

- **Request Body**: Similar ao do auto-registro, mas pode exigir um campo adicional para a senha inicial.
- **Resposta**: Retorna os dados do usuário criado (sem tokens de autenticação).

### Etapa 2: Atribuição de Papel em um Salão

Após a conta do usuário existir, um administrador do salão atribui um papel a ele.

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons/:salonId/roles/assign` | Atribui um papel a um usuário dentro de um salão específico. |

### Controle de Acesso e Permissões para Atribuição

A capacidade de atribuir papéis é estritamente controlada com base no papel do requisitante dentro do salão (`:salonId`).

| Papel do Requisitante | Papéis que pode Atribuir no Salão | Casos de Uso Atendidos |
| :--- | :--- | :--- |
| **`super_admin`** (Global) | `owner`, `admin`, `worker`, `client` | 4 |
| **`owner`** | `admin`, `worker`, `client` | - |
| **`admin`** | `worker`, `client` | 2 |
| **`worker`** | `client` | 3 |

### Request Body (`AssignRoleDto`)

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :--- | :--- |
| `userId` | `uuid` | Sim | ID do usuário que receberá o papel. |
| `roleId` | `uuid` | Sim | ID do papel a ser atribuído (`owner`, `admin`, etc.). |

### Respostas de Erro Comuns

| Status | Código de Erro | Descrição |
| :--- | :--- | :--- |
| **403 Forbidden** | `FORBIDDEN_RESOURCE` | O requisitante não tem permissão para atribuir o papel solicitado. (Ex: um `worker` tentando criar um `admin`). |
| **404 Not Found** | `USER_NOT_FOUND` / `ROLE_NOT_FOUND` | O `userId` ou `roleId` fornecido não existe. |
| **409 Conflict** | `USER_ALREADY_HAS_ROLE` | O usuário já possui o papel especificado naquele salão. |
