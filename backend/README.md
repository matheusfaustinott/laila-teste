# Sistema de Controle Financeiro Pessoal - Backend

Desenvolvi esse projeto para demonstrar conhecimentos em **Node.js, TypeScript, Express e PostgreSQL**.

É um sistema completo de controle financeiro pessoal solicitado como teste técnico, aplicando boas práticas e arquitetura MVC limpa.

## O que eu implementei

- **Sistema de autenticação JWT completo** - registro, login, middleware de auth
- **CRUD completo de transações** - receitas, despesas, categorização
- **Gestão de usuários** - perfil, estatísticas, atualização de dados
- **Categorias de transações** - organização e relatórios
- **Validações robustas** - em todas as camadas da aplicação
- **Arquitetura MVC limpa** - separação clara de responsabilidades
- **Testes com Jest** - cobertura básica dos endpoints principais
- **TypeScript** - tipagem forte em todo o projeto
- **Docker setup** - containerização do PostgreSQL

## Stack tecnológica escolhida

### Core

- **Node.js v18+** - Runtime que escolhi pela maturidade e ecossistema
- **TypeScript** - Porque tem tipagem estática
- **Express.js** - Framework minimalista e flexível que domino
- **TypeORM** - ORM que facilita muito o trabalho com PostgreSQL porem é algo novo pra mim no momento.
- **PostgreSQL** - Banco robusto para dados relacionais

### Bibliotecas essenciais

- `jsonwebtoken` - Para autenticação JWT stateless
- `bcrypt` - Hash seguro de senhas
- `http-status-codes` - Para responses HTTP semânticos
- `cors` - Configuração de CORS para frontend
- `dotenv` - Gerenciamento de variáveis de ambiente
- `jest + supertest` - Setup de testes que aprendi a configurar, não possuo muita experiencia foi mais um estudo

## Referências para o desenvolvimento

Baseei o desenvolvimento nestes recursos fundamentais:

- **[Testing TypeScript with Express](https://medium.com/@natnael.awel/how-to-setup-testing-for-typescript-with-express-js-example-83d3efbb6fd4)** - Como configurar Jest com TypeScript no Express
- **[Jest Getting Started](https://jestjs.io/docs/getting-started)** - Documentação oficial para setup de testes
- **[Graceful Shutdown](https://medium.com/@otaviopp8/graceful-shutdown-com-node-js-e-docker-820b36fd04f3)** - Implementação de shutdown graceful com Docker
- **[TypeORM DataSource](https://typeorm.io/docs/data-source/data-source/)** - Configuração do TypeORM

## Como rodar na sua máquina

### Pré-requisitos que você precisa

- Node.js v18+ instalado
- Docker e Docker Compose
- Git

### 1. Clona o repositório

```bash
git clone <url-do-repositorio>
cd laila-teste/backend
```

### 2. Instala as dependências

```bash
npm install
```

### 3. Configura as variáveis de ambiente

Cria um arquivo `.env` na raiz:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=laila

# JWT
JWT_SECRET= sabe_o+que_fazer
JWT_EXPIRATION=24h

# Server
PORT=3001
NODE_ENV=development
```

### 4. Sobe o banco de dados

```bash
cd ..
docker-compose up -d
```

### 5. Roda as migrações

```bash
npm run migration:run
```

### 6. Inicia o servidor

```bash
# Desenvolvimento com hot reload, estava acostumado com o nodemon
npm run dev

# Build para produção
npm run build
npm start
```

## Testes que implementei

Configurei um setup básico de testes com Jest para aparender a utilizar:

```bash
npm test           # Roda todos os testes
npm run test:watch # Modo watch para desenvolvimento
```

### O que testei:

- **Endpoints da API** - Registro, login, transações

Os testes são implementados com **Jest + Supertest** e cobrem os cenários principais da API de forma simples e direta.

## API

### Base URL

```
http://localhost:3001/api
```

### Autenticação

Uso JWT tokens. Depois do login, inclui o token no header:

```
Authorization: Bearer {token-jwt}
```

## Endpoints de autenticação

### POST /api/auth/registrar

Registra um novo usuário no sistema.

```json
{
  "nomeCompleto": "João Silva",
  "email": "joao@email.com",
  "senha": "senha123"
}
// A resposta deve ser algo assim:
{
  "sucesso": true,
  "dados": {
    "usuario": {
      "id": "uuid-aqui",
      "nomeCompleto": "João Silva",
      "email": "joao@email.com"
    },
    "token": "jwt-token-aqui"
  }
}
```

### POST /api/auth/login

Autentica um usuário existente.

```json
{
  "email": "joao@email.com",
  "senha": "senha123"
}

{
  "sucesso": true,
  "dados": {
    "usuario": { ... },
    "token": "jwt-token"
  }
}
```

## Endpoints de transações

### GET /api/transacoes

Lista todas as transações do usuário (precisa estar logado).

```bash
# Headers obrigatórios
Authorization: Bearer {token}
```

```json
{
  "sucesso": true,
  "dados": [
    {
      "id": "uuid",
      "descricao": "Salário",
      "valor": 5000.0,
      "tipo": "RECEITA",
      "data": "2024-01-15",
      "categoria": {
        "id": "uuid-categoria",
        "nome": "Trabalho"
      }
    }
  ]
}
```

### POST /api/transacoes

Cria uma nova transação.

```json
{
  "descricao": "Freelance",
  "valor": 1500.00,
  "tipo": "RECEITA",
  "categoriaId": "uuid-categoria"
}

{
  "sucesso": true,
  "dados": {
    "id": "uuid-nova-transacao",
    "descricao": "Freelance",
    "valor": 1500.00,
    "tipo": "RECEITA"
  }
}
```

### PUT /api/transacoes/:id + DELETE /api/transacoes/:id

Atualizar e remover transações (mesma lógica de auth).

## Outros endpoints importantes

- `GET /api/categorias` - Lista categorias do usuário
- `POST /api/categorias` - Cria nova categoria
- `GET /api/usuarios/me` - Dados do usuário logado
- `GET /api/health` - Health check da API
- `GET /api/info` - Documentação completa

## Organização do código

Usei uma estrutura MVC:

```
src/
├── app.ts                  # Configuração da aplicação Express
├── server.ts               # Entry point do servidor
├── controladores/          # Controllers da API (camada de controle)
│   ├── autenticacao.ts     # Login, registro, perfil
│   ├── usuario.ts          # CRUD de usuários
│   ├── transacao.ts        # CRUD de transações
│   └── categoria.ts        # CRUD de categorias
├── modelos/                # Models/Entities (camada de dados)
│   ├── usuario.ts          # Entity do usuário
│   ├── transacao.ts        # Entity da transação
│   ├── categoria.ts        # Entity da categoria
│   └── index.ts            # Exports centralizados
├── servicos/               # camadas de negócios
│   ├── autenticacao.ts     # Lógica de auth e JWT
│   ├── transacao.ts        # Regras de negócio das transações
│   └── categoria.ts        # Lógica das categorias
├── rotas/                  # Rotas da API
│   ├── index.ts            # Rotas principal da API
│   ├── autenticacao.ts     # Rotas de auth
│   ├── usuario.ts          # Rotas de usuário
│   ├── transacao.ts        # Rotas de transações
│   └── categoria.ts        # Rotas de categorias
├── middlewares/            # Middlewares Express
│   └── autenticacao.ts     # Middleware de verificação JWT
├── database/               # Configuração do banco
│   ├── db.ts               # DataSource do TypeORM
│   └── migrations/         # Migrações do banco
├── tipos/                  # TypeScript interfaces
│   └── index.ts            # DTOs e tipos da aplicação
├── utils/                  # Utilitários
│   ├── respostas.ts        # Funções de resposta HTTP padronizadas
│   └── validacoes.ts       # Validações de dados
└── __tests__/              # Testes automatizados
    ├── setup.ts            # Configuração do Jest
    └── api.test.ts         # Testes básicos da API
```

## Scripts

```bash
# Desenvolvimento
npm run dev              # Servidor com hot reload

# Build e Deploy
npm run build           # Compila TypeScript
npm start              # Servidor de produção

# Database
npm run migration:generate  # Gera nova migração
npm run migration:run      # Executa migrações
npm run migration:revert   # Desfaz última migração
npm run db:reset          # Reset completo do banco

# Testes
npm test               # Executa todos os testes
npm run test:watch     # Modo watch para desenvolvimento
```

## Segurança

- **Senhas hasheadas** com bcrypt e 12 salt rounds
- **JWT tokens** com expiração configurável
- **Validação** em todas as entradas
- **CORS configurado** adequadamente
- **Middleware de auth** protegendo rotas sensíveis
- **Graceful shutdown** para deploys sem downtime

## Testes Básicos

Implementei um setup simples:

- **Health check** da aplicação
- **Endpoints de auth** (registro/login)
- **Endpoints de transações** (CRUD básico)
- **Validações** de email e senha
- **Casos de erro** (dados inválidos, não autorizado)

Comando `npm test` para rodar os testes.

## Decisões técnicas que tomei

### Por que TypeScript?

Tipagem estática me ajuda muito a evitar bugs e torna o código mais legível e manutenível.

### Por que TypeORM?

Facilita muito o trabalho com banco relacional, migrations automáticas e relacionamentos.

### Por que JWT?

Autenticação stateless que escala bem e não precisa de sessões no servidor.

### Por que essa estrutura MVC?

Separação clara de responsabilidades facilita testes, manutenção e trabalho em equipe.

Para dúvidas ou problemas, confira se:

1. Todas as dependências estão instaladas (`npm install`)
2. Banco de dados está rodando (`docker-compose up -d`)
3. Variáveis de ambiente estão configuradas (arquivo `.env`)
4. Migrações foram executadas (`npm run migration:run`)

Se persistir algum erro, rode `npm run db:reset` para resetar o banco!

## Códigos de resposta que uso

- `200` - Sucesso
- `201` - Criado
- `204` - Sem conteúdo (DELETE)
- `400` - Dados inválidos
- `401` - Não autorizado
- `404` - Não encontrado
- `409` - Conflito (email já existe)
- `500` - Erro interno
