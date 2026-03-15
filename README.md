# BeTalent Gateway API

API RESTful para sistema de pagamento **multi-gateway** (Teste Prático Nível 3), desenvolvida em **AdonisJS 7** com **Clean Architecture**, use-cases, roles, Circuit Breaker e padrões Repository, DI, Singleton e Strategy/Adapter.

---

## Requisitos

- Node.js ≥ 20.x
- npm ≥ 11.x
- MySQL 8 (ou uso do Docker Compose)
- (Opcional) Docker e Docker Compose para rodar mocks dos gateways e banco

---

## Instalação e execução

```bash
git clone <repo>
cd gateway
npm install

cp .env.example .env
# Gerar APP_KEY: node ace generate:key
# Configurar DB_* e GATEWAY_* no .env
```

### Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `APP_KEY` | Chave da aplicação (obrigatório) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` | Conexão MySQL |
| `GATEWAY_1_URL`, `GATEWAY_1_EMAIL`, `GATEWAY_1_TOKEN` | Gateway 1 (mock) |
| `GATEWAY_2_URL`, `GATEWAY_2_AUTH_TOKEN`, `GATEWAY_2_AUTH_SECRET` | Gateway 2 (mock) |

### Rodar sem Docker

```bash
# 1. Subir MySQL e criar banco "gateway"
# 2. Migrations e seed
node ace migration:run
node ace db:seed

# 3. Mocks dos gateways (outro terminal)
docker run -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock

# 4. API
npm run dev
```

**API:** http://localhost:3333

### Rodar com Docker Compose

```bash
docker-compose up -d
# API: http://localhost:3333
# MySQL: localhost:3306
# Gateways mock: 3001 (Gateway 1), 3002 (Gateway 2)
```

---

## Testes

```bash
npm run test           # todos
node ace test unit     # apenas unitários
node ace test functional  # apenas funcionais (requer servidor)
```

---

## Detalhamento de rotas

Todas as respostas são **JSON**. Rotas privadas exigem header: `Authorization: Bearer <token>`.

### Rotas públicas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/auth/login` | Login. Body: `{ "email", "password" }`. Retorna `{ data: { user, token } }`. |
| POST | `/api/v1/purchases` | Compra. Body: `{ name, email, cardNumber, cvv, items: [{ productId, quantity }] }`. |

### Rotas privadas (por role)

| Método | Rota | Roles | Descrição |
|--------|------|--------|-----------|
| GET, POST, PUT, DELETE | `/api/v1/users` | admin, manager | CRUD de usuários |
| GET, POST, PUT, DELETE | `/api/v1/products` | admin, manager, finance | CRUD de produtos |
| GET | `/api/v1/clients` | admin, manager, finance | Listar clientes |
| GET | `/api/v1/clients/:id` | admin, manager, finance | Detalhe do cliente com compras |
| GET | `/api/v1/transactions` | admin, finance | Listar transações |
| GET | `/api/v1/transactions/:id` | admin, finance | Detalhe da transação |
| POST | `/api/v1/transactions/:id/refund` | admin, finance | Reembolso |
| PATCH | `/api/v1/gateways/:id/toggle` | admin | Ativar/desativar gateway. Body: `{ isActive }` |
| PATCH | `/api/v1/gateways/:id/priority` | admin | Alterar prioridade. Body: `{ priority }` |

### Roles

- **admin** – acesso total
- **manager** – CRUD produtos e usuários, listar clientes
- **finance** – CRUD produtos, listar clientes/transações, reembolso
- **user** – apenas compras (rota pública)

---

## Exemplos de requisição

**Login**
```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@betalent.tech","password":"secret"}'
```

**Compra**
```bash
curl -X POST http://localhost:3333/api/v1/purchases \
  -H "Content-Type: application/json" \
  -d '{
    "name":"João",
    "email":"joao@email.com",
    "cardNumber":"5569000000006063",
    "cvv":"010",
    "items":[{"productId":1,"quantity":2}]
  }'
```

**Listar produtos (autenticado)**
```bash
curl http://localhost:3333/api/v1/products \
  -H "Authorization: Bearer <token>"
```

---

## Arquitetura e padrões

### Clean Architecture

- **Domain** (`app/domain/`) – entidades, enums (Role, TransactionStatus), contratos (repositórios, IGatewayAdapter). Sem dependência de framework.
- **Application** (`app/application/`) – use-cases e serviços (PaymentService, CircuitBreaker). Orquestram a lógica e dependem apenas das interfaces do domain.
- **Infra** (`app/infra/`) – modelos Lucid, repositórios concretos, adapters dos gateways. Implementam as interfaces do domain.
- **HTTP** – controllers, middleware (auth, role), validators VineJS. Apenas validam entrada, chamam use-case e devolvem JSON.

### Padrões utilizados

- **Repository** – interfaces no domain (ex.: `IUserRepository`), implementações Lucid no infra. Use-cases dependem das interfaces.
- **DI (IoC)** – `AppProvider` registra repositórios, adapters, circuit breakers e use-cases no container; controllers resolvem use-cases com `app.container.make('...')`.
- **Singleton** – todos os bindings no container são singleton (uma instância por processo), incluindo Circuit Breaker por gateway.
- **Circuit Breaker** – um por gateway; estados CLOSED → OPEN → HALF_OPEN para não insistir em gateway instável; falha em um gateway leva à tentativa no próximo.
- **Strategy/Adapter** – `IGatewayAdapter` (charge, refund); Gateway1Adapter e Gateway2Adapter implementam a interface. Novo gateway = nova classe + registro no provider.

### Explicação dos padrões (por que cada um foi escolhido)

#### Clean Architecture

A aplicação é organizada em camadas (domain → application → infra → HTTP) para **separar regras de negócio** do framework e do banco. O domain não importa Adonis nem Lucid; os use-cases dependem só de interfaces. Assim, testes unitários podem mockar repositórios e gateways sem tocar em banco ou HTTP, e trocar MySQL por outro banco (ou trocar o provedor de pagamento) exige mudanças apenas na camada de infra, sem reescrever regras de negócio.

#### Repository

As interfaces de repositório (`IUserRepository`, `IProductRepository`, etc.) ficam no **domain**; as implementações concretas (Lucid) ficam no **infra**. Os use-cases recebem apenas a interface (via DI). **Motivo:** a aplicação não precisa saber *como* os dados são persistidos (tabelas, queries). Isso facilita testes (mock do repositório retornando dados fixos) e troca de persistência no futuro sem alterar use-cases.

#### Injeção de dependência (DI / IoC)

O `AppProvider` registra no container do Adonis todas as implementações (repositórios, adapters, Circuit Breaker, use-cases). Os controllers não instanciam nada com `new`; pedem ao container: `app.container.make('PurchaseUseCase')`. **Motivo:** o controller não precisa conhecer as dependências do use-case (quantos repositórios, qual PaymentService). Quem monta o grafo de dependências é o provider em um único lugar, o que deixa o código mais testável e desacoplado.

#### Singleton

Todos os bindings no provider usam `container.singleton(...)`. **Motivo:** repositórios, adapters e especialmente o **Circuit Breaker** precisam manter estado entre requisições (ex.: contagem de falhas do gateway). Se cada requisição criasse uma nova instância do Circuit Breaker, ele nunca “abriria” o circuito. Com singleton, uma única instância por gateway é compartilhada por todo o processo, e o estado OPEN/HALF_OPEN/CLOSED funciona corretamente.

#### Circuit Breaker

Cada gateway de pagamento tem seu próprio Circuit Breaker. Após N falhas consecutivas (ex.: 3), o circuito passa para **OPEN** e o serviço para de chamar aquele gateway por um tempo (ex.: 30s); depois passa para **HALF_OPEN** e tenta de novo. **Motivo:** quando um gateway externo está fora do ar ou muito lento, não faz sentido continuar enviando requisições que vão falhar. O Circuit Breaker “corta” temporariamente aquele gateway e deixa o `PaymentService` tentar o próximo da lista (por prioridade), melhorando latência e resiliência.

#### Strategy / Adapter (gateways de pagamento)

A interface `IGatewayAdapter` define apenas `charge(data)` e `refund(externalId)`. Cada provedor (Gateway 1, Gateway 2) tem uma classe que implementa essa interface e traduz para a API específica (HTTP, payload, autenticação). O `PaymentService` recebe uma lista de gateways e um *resolver* que, dado um gateway, devolve o adapter e o Circuit Breaker corretos. **Motivo:** adicionar um novo gateway (ex.: Stripe) não exige alterar use-cases nem o PaymentService; basta criar `StripeAdapter` implementando `IGatewayAdapter` e registrar no provider. O fluxo de “tentar por prioridade com Circuit Breaker” permanece o mesmo.

#### Use-case por ação

Cada operação de negócio (login, criar usuário, compra, reembolso, etc.) tem um use-case dedicado com um método `execute(...)`. O controller só valida a entrada (VineJS), chama o use-case e devolve a resposta. **Motivo:** a lógica de negócio fica concentrada e testável sem HTTP; um use-case faz uma coisa só, o que facilita leitura, manutenção e testes unitários com mocks.

### Fluxo de pagamento

1. Controller valida o body e chama `PurchaseUseCase.execute(...)`.
2. Use-case busca/cria cliente, calcula total pelos produtos, obtém gateways ativos por prioridade.
3. `PaymentService.charge()` tenta cada gateway (com Circuit Breaker); no primeiro sucesso retorna.
4. Use-case persiste transação e itens e retorna a transação.
5. Se todos os gateways falharem, retorna 422 com mensagem "All payment gateways failed".

---

## Critérios de avaliação atendidos

- **Lógica de programação** – regras no domain e nos use-cases; controllers finos.
- **Organização do projeto** – Clean Architecture com camadas bem definidas (domain, application, infra, http).
- **Legibilidade do código** – nomes claros, use-cases com um objetivo cada, contratos explícitos.
- **Validação dos dados** – VineJS em todas as entradas (login, purchase, user CRUD, product CRUD, gateway).
- **Uso adequado dos recursos** – ORM Lucid, Auth com tokens, middleware de role, env para configuração.
- **Padrões especificados** – Repository, DI, Singleton, Circuit Breaker, Strategy/Adapter.
- **Dados sensíveis** – senha hasheada (hash.make), nunca retornada (serializeAs: null); token JWT no login; dados de cartão só trafegam para os gateways e apenas os últimos 4 dígitos são persistidos.
- **Clareza na documentação** – este README com requisitos, instalação, rotas, arquitetura e exemplos.

---

## Considerações finais

### Implementado

- Nível 3 completo: múltiplos produtos/quantidades, valor calculado no back, gateways com autenticação.
- Roles: ADMIN, MANAGER, FINANCE, USER com middleware de autorização por rota.
- CRUD de usuários e produtos, listagem de clientes e transações, detalhe de cliente/transação, reembolso, ativar/desativar e prioridade de gateways.
- Clean Architecture com domain, application (use-cases), infra e HTTP.
- Padrões: Repository, DI, Singleton, Circuit Breaker, Strategy/Adapter.
- Validação VineJS, respostas em JSON, MySQL com Lucid.
- TDD: testes unitários (CircuitBreaker, use-cases com mocks) e funcionais (auth, rotas).
- Docker Compose com MySQL, aplicação e mock dos gateways.
- README com requisitos, instalação, rotas e arquitetura.

### Dificuldades encontradas

- Nunca tinha usado AdonisJS.
