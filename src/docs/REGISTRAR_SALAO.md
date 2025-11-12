# Funcionalidade: Registrar Novo Salão (`Salons.Create`)

Esta funcionalidade permite a criação de uma nova entidade de Salão de Beleza na plataforma. O salão é a entidade central que agrupa dados operacionais como serviços, produtos, funcionários e agendamentos.

## 1. Endpoint da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons` | Cria um novo Salão de Beleza. |

## 2. Controle de Acesso e Permissões

A criação de salões é uma operação restrita e segue as seguintes regras de permissão:

| Usuário/Role | Permissão Necessária | Descrição do Acesso |
| :--- | :--- | :--- |
| **Super Admin** (`global_role: 'super_admin'`) | Nenhuma | Acesso irrestrito. Pode criar um salão e designar qualquer usuário existente como o proprietário (`owner`). |
| **Admin** (`global_role: 'admin'`) | Nenhuma | Pode criar um novo salão, e será **automaticamente definido como o Proprietário (`owner`)** do salão recém-criado. |

## 3. Estrutura da Requisição (Request Body)

O corpo da requisição deve ser enviado no formato JSON.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de Valor |
| :--- | :--- | :--- | :--- | :--- |
| **`name`** | `string` | Sim | Nome oficial do salão. Será usado para gerar o `slug`. | `"Beleza Pura Salão & Spa"` |
| **`description`** | `string` | Não | Uma breve descrição sobre o salão. | `"Especialistas em cortes, coloração e tratamentos capilares."` |
| **`address`** | `string` | Não | Endereço físico do estabelecimento. | `"Rua das Flores, 123, São Paulo, SP"` |
| **`phone`** | `string` | Não | Telefone de contato principal do salão. | `"+5511987654321"` |
| **`email`** | `string` | Não | E-mail de contato do salão. | `"contato@belezapura.com"` |
| **`business_hours`** | `BusinessHourItemDto[]` | Sim | Horário de funcionamento padrão, estruturado como um array de objetos (ver seção 4). | `[...]` |
| **`owner_user_id`** | `UUID` | Não* | *Opcional apenas para `super_admin`*. ID do usuário que será o proprietário (`owner`). Se omitido, o usuário que faz a requisição é definido como `owner`. | `"4b8d7a12-c5f3-4e6f-9b0c-1d3a5e8c2f0b"` |


### Notas sobre os campos:
- O campo `slug` (URL amigável) é **gerado automaticamente** a partir do `name` e não precisa ser enviado.
- O `owner` do salão é definido automaticamente com base no usuário que faz a requisição, a menos que um `super_admin` especifique um `owner_user_id` diferente.

## 4. Estrutura Detalhada de `business_hours`

O campo `business_hours` é um array de objetos, onde cada objeto representa um dia da semana. A estrutura segue o `BusinessHourItemDto`.

```typescript
interface BusinessHourItem {
  day: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  isClosed: boolean;
  open?: string;  // Formato "HH:MM"
  close?: string; // Formato "HH:MM"
}
```

### Exemplo de `business_hours`:

```json
[
  { "day": "MONDAY", "open": "09:00", "close": "18:00", "isClosed": false },
  { "day": "TUESDAY", "open": "09:00", "close": "18:00", "isClosed": false },
  { "day": "WEDNESDAY", "open": "09:00", "close": "18:00", "isClosed": false },
  { "day": "THURSDAY", "open": "09:00", "close": "19:00", "isClosed": false },
  { "day": "FRIDAY", "open": "09:00", "close": "20:00", "isClosed": false },
  { "day": "SATURDAY", "open": "08:00", "close": "17:00", "isClosed": false },
  { "day": "SUNDAY", "isClosed": true }
]
```

## 5. Processos Automáticos na Criação

Ao receber uma requisição válida, o sistema executa os seguintes processos:

1.  **Geração do `slug`**: Um `slug` único e amigável para URLs é gerado a partir do campo `name`. Por exemplo, "Beleza Pura Salão & Spa" pode se tornar `beleza-pura-salao-spa-1`.
2.  **Criação da Entidade `Salon`**: Um novo registro é criado na tabela `salons` com os dados fornecidos e o `slug` gerado.
3.  **Atribuição do Proprietário (`owner`)**:
    - O usuário que realizou a requisição é identificado.
    - Um registro é criado na tabela `user_salon_roles` vinculando o `user_id` do requisitante, o `salon_id` recém-criado e o `role_id` correspondente a "owner".

## 6. Respostas da API

### Resposta de Sucesso (Status `201 Created`)

A API retorna o objeto completo do salão recém-criado.

```json
{
  "id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
  "name": "Beleza Pura Salão & Spa",
  "slug": "beleza-pura-salao-spa-1",
  "description": "Especialistas em cortes, coloração e tratamentos capilares.",
  "address": "Rua das Flores, 123, São Paulo, SP",
  "phone": "+5511987654321",
  "email": "contato@belezapura.com",
  "business_hours": [...],
  "is_active": true,
  "created_at": "2025-11-11T10:00:00.000Z",
  "updated_at": "2025-11-11T10:00:00.000Z",
  "deleted_at": null
}
```

### Respostas de Erro

| Status | Código de Erro | Descrição |
| :--- | :--- | :--- |
| **400 Bad Request** | `VALIDATION_ERROR` | Ocorre se campos obrigatórios (`name`, `business_hours`) não forem fornecidos ou se os dados estiverem em formato inválido (ex: `email` incorreto, `business_hours` malformado). |
| **401 Unauthorized** | `UNAUTHORIZED` | Ocorre se o usuário não estiver autenticado (token JWT ausente ou inválido). |
| **403 Forbidden** | `FORBIDDEN` | Ocorre se o usuário autenticado não possuir a role (`admin` ou `super_admin`) necessária para criar um salão. |
| **409 Conflict** | `SLUG_ALREADY_EXISTS` | Embora raro devido à geração automática, pode ocorrer se um `slug` gerado já existir. O sistema deve tentar regenerar com um sufixo diferente. |
| **500 Internal Server Error** | `INTERNAL_SERVER_ERROR` | Falha inesperada no servidor durante o processo de criação. |

## 7. Regras de Negócio e Validações

- **`name`**: Deve ser uma string não vazia com no máximo 100 caracteres.
- **`business_hours`**:
    - Deve ser um array contendo objetos para os 7 dias da semana.
    - Para dias de funcionamento (`isClosed: false`), os campos `open` e `close` são obrigatórios e devem estar no formato "HH:MM".
- **Unicidade**: O `slug` gerado deve ser único na plataforma. A lógica de geração deve garantir isso, adicionando sufixos numéricos se necessário.
- **Transacionalidade**: A criação do salão e a atribuição do papel de `owner` devem ocorrer de forma transacional. Se a atribuição do papel falhar, a criação do salão deve ser revertida (rollback).
