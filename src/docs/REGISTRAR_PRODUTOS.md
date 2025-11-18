# Funcionalidade: Registrar Produto do Salão (`Products.Create`)

Este documento descreve o processo de criação e gestão de produtos vendidos pelo salão (ex.: shampoos, condicionadores, kits). Produtos pertencem a um `salon` e podem ser controlados por papéis e permissões quando aplicável.

## 1. Endpoint da API

| Método | URL | Descrição |
| :--- | :--- | :--- |
| **POST** | `/api/salons/:salonId/products` | Cria um novo produto para o salão especificado. |
| **GET** | `/api/salons/:salonId/products` | Lista produtos do salão (paginação/filtros). |
| **PUT** | `/api/salons/:salonId/products/:productId` | Atualiza um produto existente. |
| **DELETE** | `/api/salons/:salonId/products/:productId` | Remove/desativa um produto (soft-delete recomendado). |

## 2. Controle de Acesso e Permissões

A gestão de produtos deve ser protegida por RBAC; recomenda-se as regras abaixo:

| Papel / Contexto | Permissão necessária | Observações |
| :--- | :--- | :--- |
| **Super Admin** (`global_role = 'super_admin'`) | Nenhuma (acesso total) | Pode gerir produtos em qualquer salão. |
| **Owner** (do salão) | Nenhuma | Owner tem controle total sobre o catálogo do salão. |
| **Admin** (do salão) | Nenhuma | Pode criar/editar/excluir produtos. |
| **Worker** (do salão) | `products.manage` (opcional) | Permissão necessária se a política exigir controle granular para workers. |

Regra de autorização (implementação esperada):
- Super admin bypass.
- Senão, verificar papel do requisitante no `salonId`: owner/admin → permitir; worker → permitir somente se `role_permissions` incluir `products.manage`.

## 3. Estrutura da Requisição (Request Body)

O corpo da requisição deve ser enviado em JSON. DTO sugerido: `CreateProductDto`.

| Campo | Tipo | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `name` | `string` | Sim | Nome do produto (máx. 150 caracteres). Único por `salonId` preferencialmente. |
| `description` | `string` | Não | Descrição do produto. |
| `sku` | `string` | Não | Código SKU interno (opcional). |
| `price` | `number` (decimal) | Sim | Preço de venda (>= 0). Use DECIMAL(10,2) no DB. |
| `cost` | `number` (decimal) | Não | Custo do produto (opcional). Não retornar em APIs públicas se sensível. |
| `stock` | `integer` | Não | Quantidade em estoque (inteiro >= 0). |
| `isActive` | `boolean` | Não | Produto ativo/visível (default: `true`). |
| `categoryId` | `uuid` | Não | Referência a categoria de produto (se existir). |

Exemplo de DTO (TypeScript):

```ts
export class CreateProductDto {
  @IsString() @MaxLength(150) name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() sku?: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) cost?: number;
  @IsOptional() @IsInt() @Min(0) stock?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsUUID() categoryId?: string;
}
```

Notas de segurança: não exponha campos sensíveis (ex.: `cost`) em respostas públicas sem autorização apropriada.

## 4. Processo Automático na Criação

Ao receber uma requisição válida:

1. Autenticar e autorizar o requisitante (ver seção 2).
2. Validar payload via DTO.
3. Verificar existência de `salonId` (retornar `404` se não existir).
4. Checar duplicidade (`name` / `sku`) no salão; se duplicado, retornar `409`.
5. Inserir registro em `products` com `salon_id`, `name`, `description`, `sku`, `price`, `cost`, `stock`, `is_active`, `category_id`.
6. Commit e retornar `201 Created` com o objeto do produto (sem campos sensíveis quando não autorizado).

## 5. Exemplo de Request

```json
{
  "name": "Shampoo Hidratante 300ml",
  "description": "Shampoo nutritivo para cabelos secos",
  "sku": "SH-HID-300",
  "price": 29.90,
  "cost": 12.50,
  "stock": 40,
  "isActive": true
}
```

## 6. Exemplo de Resposta (201 Created)

```json
{
  "id": "product-uuid-1234",
  "salonId": "salon-1-uuid",
  "name": "Shampoo Hidratante 300ml",
  "description": "Shampoo nutritivo para cabelos secos",
  "sku": "SH-HID-300",
  "price": 29.90,
  "stock": 40,
  "isActive": true,
  "createdAt": "2025-11-12T10:00:00Z"
}
```

## 7. Erros e Códigos de Resposta

| Status | Código | Descrição |
| :--- | :--- | :--- |
| 400 Bad Request | `VALIDATION_ERROR` | Payload inválido. |
| 401 Unauthorized | `UNAUTHORIZED` | Token ausente ou inválido. |
| 403 Forbidden | `FORBIDDEN` | Usuário sem permissão para gerir produtos. |
| 404 Not Found | `SALON_NOT_FOUND` / `CATEGORY_NOT_FOUND` | Entidade referenciada não existe. |
| 409 Conflict | `PRODUCT_CONFLICT` | Produto com mesmo `name` ou `sku` já existe no salão. |

## 8. Regras de Negócio e Recomendações Técnicas

- Unicidade: aplicar constraint opcional `UNIQUE (salon_id, lower(name))` e `UNIQUE (salon_id, sku)` quando SKU usado.
- Estoque: se o sistema controlar estoque, manter operações atômicas para debit/credit e considerar lock row/update para concorrência.
- Preço: armazenar como DECIMAL(10,2) e validar no DTO; evitar float impreciso.
- Categorização: suportar `categoryId` como FK opcional para agrupar produtos.
- Soft-delete: ao excluir, usar `is_active=false` e popular `deleted_at` para auditoria e histórico.
- Sanitização: strip HTML de `description` antes de salvar.

## 9. Auditoria, Eventos e Integrações

- Registrar `created_by` e `updated_by` para rastreabilidade.
- Emitir eventos: `product.created`, `product.updated`, `product.deleted` para sincronização com front-end, ERPs ou sistemas de inventário.
- Integração com POS/inventário: prever campos adicionais (barcode, supplier_id) e endpoints batch para sincronização de estoque.

## 10. Testes Recomendados

- Unit:
  - `ProductsService.create()` — validação, persistência e tratamento de duplicidade.
  - Regras de autorização: owner/admin/worker sem permissão.
- Integration/E2E:
  - Criar produto via API → `201`.
  - Tentar criar produto duplicado → `409`.
  - Atualizar estoque via endpoint → verificar concorrência e consistência.

## 11. Critérios de Aceitação

- Endpoint protegido por JWT e autorização conforme seção 2.
- Produto criado retorna `201` e não expõe campos sensíveis sem permissão.
- Unicidade e integridade garantidas por validação + constraints DB.

---

Observação: alinhar seeds e `DIRETRIZES.md` para incluir categorias de produto comuns e regras de estoque; criar `docs/seeds/seed_product_categories.sql` se útil para ambiente de desenvolvimento.
