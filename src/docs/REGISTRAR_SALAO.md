# Funcionalidade: Registrar Novo Salão (`Salons.Create`)

Esta funcionalidade permite a criação de uma nova entidade de Salão de Beleza na plataforma, que servirá como um contêiner para todos os dados operacionais (serviços, produtos, funcionários, agendamentos) desse estabelecimento.

## 1. Endpoint da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons` | Cria um novo Salão de Beleza. |

## 2. Controle de Acesso e Permissões

| Usuário/Role | Permissão Necessária | Descrição do Acesso |
| :--- | :--- | :--- |
| **Super Admin** (`global_role`) | N/A | Acesso irrestrito. Pode criar o salão e se atribuir a ele ou a outro usuário. |
| **Usuário Comum** (`global_role: user`) | N/A | O usuário logado que faz a requisição é automaticamente definido como o **Proprietário (`owner`)** do salão criado. |

## 3. Estrutura da Requisição (Request Body)

O corpo da requisição deve ser enviado no formato JSON, contendo os dados básicos e operacionais do novo salão.

| Campo | Tipo | Obrigatório | Descrição | Exemplo de Valor |
| :--- | :--- | :--- | :--- | :--- |
| **`name`** | `string` | Sim | Nome oficial do salão. | `"Beleza Pura Salão & Spa"` |
| **`slug`** | `string` | Sim | URL amigável e única para o salão. (Ex: `beleza-pura`). | `"beleza-pura-sp"` |
| **`address`** | `string` | Sim | Endereço completo do salão. | `"Rua das Flores, 123 - Centro"` |
| **`phone`** | `string` | Não | Telefone de contato do estabelecimento. | `"+5511987654321"` |
| **`owner_user_id`** | `UUID` | Não* | ID do usuário que será definido como o **Proprietário (`owner`)** do salão. *Opcional apenas para `super_admin`. Se omitido, o ID do usuário autenticado é usado. | `"4b8d7a12-c5f3-4e6f-9b0c-1d3a5e8c2f0b"` |
| **`business_hours`** | `object` | Sim | Horário de funcionamento padrão (ver seção 4). | `{...}` |

### 4. Estrutura Detalhada de `business_hours`

O objeto `business_hours` define os dias e horários de operação do salão.

```json
{
  "monday": { "start": "09:00", "end": "18:00" },
  "tuesday": { "start": "09:00", "end": "18:00" },
  "wednesday": { "start": "09:00", "end": "18:00" },
  "thursday": { "start": "09:00", "end": "19:00" },
  "friday": { "start": "09:00", "end": "20:00" },
  "saturday": { "start": "08:00", "end": "17:00" },
  "sunday": null, // ou { "start": null, "end": null } para fechado
  "exceptions": [
    // Para feriados ou datas especiais
    { "date": "2025-12-25", "start": null, "end": null }, // Fechado no Natal
    { "date": "2025-01-01", "start": "12:00", "end": "16:00" } // Horário especial no Ano Novo
  ]
}