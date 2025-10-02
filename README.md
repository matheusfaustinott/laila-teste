# 🏦 Sistema de Controle Financeiro Pessoal

Sistema completo de gestão financeira pessoal construído com **Node.js**, **React** e **PostgreSQL**.

## 🚀 Execução Rápida (Teste Técnico)

**Requisito único**: Docker e Docker Compose instalados

```bash
# Clone o repositório
git clone <seu-repositorio>
cd laila-teste

# Execute tudo com um comando (versão estável)
docker-compose up -d

# OU se quiser ver os logs em tempo real
docker-compose up

# Para rebuild completo (se necessário)
docker-compose down -v && docker-compose up --build
```

> **💡 Nota**: Se encontrar erro com `docker-compose up --build`, use primeiro `docker-compose build` e depois `docker-compose up -d` para uma execução mais estável.

**Pronto!** O sistema estará rodando em poucos minutos:

- **🌐 Frontend**: http://localhost:3000
- **⚙️ Backend**: http://localhost:3001
- **📚 Documentação**: http://localhost:3001/api/info

### 🧪 Teste Rápido da API

```bash
# Criar usuário
curl -X POST http://localhost:3001/api/auth/registrar \
  -H "Content-Type: application/json" \
  -d '{"nomeCompleto":"Teste User","email":"teste@exemplo.com","senha":"senha123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","senha":"senha123"}'
```

## ✅ Funcionalidades Implementadas

### 1. **Autenticação JWT**

- ✅ Cadastro com nome, email e senha
- ✅ Login com autenticação JWT
- ✅ Middleware de proteção das rotas

### 2. **Lançamentos Financeiros**

- ✅ CRUD completo (criar, listar, editar, excluir)
- ✅ Campos: título, valor, tipo (receita/despesa), categoria, data
- ✅ Relacionamento usuário → lançamentos
- ✅ Filtros e paginação

### 3. **Categorias**

- ✅ CRUD de categorias personalizadas por usuário
- ✅ Categorias padrão + criação de novas
- ✅ Relacionamento categoria → lançamentos

### 4. **Resumo Mensal**

- ✅ Total de receitas
- ✅ Total de despesas
- ✅ Saldo (receitas - despesas)
- ✅ Filtro por mês/ano

### 5. **Frontend React**

- ✅ Tela de login/cadastro
- ✅ Dashboard com lançamentos
- ✅ Formulários para CRUD
- ✅ Visualização do resumo mensal
- ✅ Interface para gerenciar categorias

### 6. **Banco PostgreSQL**

- ✅ TypeORM com migrations automáticas
- ✅ Relacionamentos: usuário → lançamentos → categorias
- ✅ Schema gerado automaticamente

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript)

```
backend/
├── src/
│   ├── controladores/    # Controllers da API
│   ├── modelos/         # Entidades TypeORM
│   ├── rotas/          # Rotas REST
│   ├── middlewares/    # JWT, CORS, validação
│   ├── servicos/       # Lógica de negócio
│   ├── database/       # Configuração e migrations
│   └── utils/          # Utilitários
└── Dockerfile
```

### Frontend (React + Material-UI)

```
frontend/
├── src/
│   ├── componentes/    # Componentes React
│   ├── paginas/       # Páginas principais
│   ├── servicos/      # API client (Axios)
│   ├── estado/        # Estado global (Signals)
│   └── config/        # Configurações
└── Dockerfile
```

### Docker

```
├── docker-compose.yml  # Orquestração completa
├── backend/Dockerfile  # Build multi-stage
└── frontend/Dockerfile # Build + Nginx
```

## 🔧 Tecnologias

**Backend:**

- Node.js 18 + TypeScript
- Express.js + CORS
- TypeORM + PostgreSQL
- JWT Authentication
- Bcrypt para senhas

**Frontend:**

- React 18 + Hooks
- Material-UI v5
- @preact/signals (estado)
- Axios (API client)

**DevOps:**

- Docker multi-stage builds
- PostgreSQL containerizado
- Nginx para servir o React
- Healthchecks automáticos

## 📊 Extras Implementados

- ✅ **Filtros por data e categoria**
- ✅ **Paginação nos lançamentos**
- ✅ **Validação completa (backend + frontend)**
- ✅ **Interface responsiva**
- ✅ **Estado reativo (Signals)**
- ✅ **Organização modular do código**
- ✅ **Migrations automáticas**
- ✅ **Schema auto-gerado**

## 🛑 Comandos Úteis

```bash
# Ver status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs backend
docker-compose logs frontend

# Parar tudo
docker-compose down

# Reset completo (apaga dados)
docker-compose down -v && docker-compose up --build

# Rebuild específico (se houver problemas)
docker-compose build backend
docker-compose build frontend
docker-compose up -d

# Verificar se está funcionando
curl http://localhost:3001/api/health
curl http://localhost:3000
```

## 🔧 Troubleshooting

**Problema**: Erro `'ContainerConfig'` no docker-compose up --build
**Solução**:

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

**Problema**: Containers não iniciam
**Solução**:

```bash
docker-compose ps  # ver status
docker-compose logs <nome-servico>  # ver logs específicos
```

**Problema**: Frontend não carrega
**Solução**: Verificar se todas as portas estão livres (3000, 3001, 5432)

## 📝 Endpoints da API

### Autenticação

- `POST /api/auth/registrar` - Criar usuário
- `POST /api/auth/login` - Login

### Lançamentos

- `GET /api/transacoes` - Listar (paginado + filtros)
- `POST /api/transacoes` - Criar
- `PUT /api/transacoes/:id` - Atualizar
- `DELETE /api/transacoes/:id` - Excluir
- `GET /api/transacoes/resumo/mensal` - Resumo mensal

### Categorias

- `GET /api/categorias` - Listar por usuário
- `POST /api/categorias` - Criar
- `PUT /api/categorias/:id` - Atualizar
- `DELETE /api/categorias/:id` - Excluir

---

**Desenvolvido por**: Matheus Faustino
**Teste Técnico**: Gerenciador de Finanças Pessoais
**Stack**: Node.js, React, PostgreSQL, Docker

## 🔗 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação**: http://localhost:3001/api/info
- **Health Check**: http://localhost:3001/api/health

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript)

```
backend/
├── src/
│   ├── controladores/     # Controllers (auth, transações, categorias)
│   ├── modelos/          # Entidades TypeORM (Usuario, Transacao, Categoria)
│   ├── rotas/           # Rotas da API REST
│   ├── middlewares/     # Autenticação JWT, CORS, validação
│   ├── servicos/        # Lógica de negócio
│   ├── database/        # Configuração DB e migrations
│   └── utils/           # Utilitários e helpers
├── docker-compose.yml   # PostgreSQL containerizado
└── package.json
```

### Frontend (React + Material-UI)

```
frontend/
├── src/
│   ├── componentes/     # Componentes React reutilizáveis
│   ├── paginas/        # Páginas principais (Login, Dashboard)
│   ├── servicos/       # Integração com API (Axios)
│   ├── estado/         # Gerenciamento de estado (@preact/signals)
│   ├── config/         # Configurações e constantes
│   └── strings/        # Textos centralizados (i18n ready)
└── package.json
```

## 📊 Funcionalidades

### ✅ Implementadas

- [x] **Autenticação JWT** (login/registro)
- [x] **CRUD Transações** (receitas/despesas)
- [x] **CRUD Categorias** (opcional por transação)
- [x] **Resumo Mensal** (estatísticas e gráficos)
- [x] **Filtros e Paginação**
- [x] **Interface Responsiva** (Material-UI)
- [x] **Validação Completa** (backend + frontend)
- [x] **Banco Relacional** (PostgreSQL + TypeORM)

### 🔧 Tecnologias

**Backend:**

- Node.js + TypeScript
- Express.js + CORS
- TypeORM + PostgreSQL
- JWT Authentication
- Bcrypt para senhas
- Validação com express-validator

**Frontend:**

- React 18 + Hooks
- Material-UI v5
- @preact/signals (estado reativo)
- Axios (requisições)
- React Hook Form

**DevOps:**

- Docker Compose
- Scripts automatizados
- Logs estruturados
- Health checks

## 🧪 Testes de API

O script `test-api.sh` executa automaticamente:

1. ✅ Registro de usuário
2. ✅ Login e obtenção de token JWT
3. ✅ Criação de categoria
4. ✅ Criação de transação com categoria
5. ✅ Criação de transação sem categoria
6. ✅ Listagem paginada
7. ✅ Resumo mensal com estatísticas

## 📝 Endpoints da API

### Autenticação

- `POST /api/auth/registrar` - Criar usuário
- `POST /api/auth/login` - Login

### Transações

- `GET /api/transacoes` - Listar (paginado + filtros)
- `POST /api/transacoes` - Criar
- `PUT /api/transacoes/:id` - Atualizar
- `DELETE /api/transacoes/:id` - Excluir
- `GET /api/transacoes/resumo/mensal` - Estatísticas

### Categorias

- `GET /api/categorias` - Listar
- `POST /api/categorias` - Criar
- `PUT /api/categorias/:id` - Atualizar
- `DELETE /api/categorias/:id` - Excluir

## 🗃️ Schema do Banco

```sql
-- Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomeCompleto VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    senha VARCHAR NOT NULL,
    criadoEm TIMESTAMP DEFAULT NOW()
);

-- Categorias (relacionadas a usuário)
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR NOT NULL,
    descricao VARCHAR,
    usuarioId UUID NOT NULL REFERENCES usuarios(id),
    criadoEm TIMESTAMP DEFAULT NOW()
);

-- Transações (relacionadas a usuário, categoria opcional)
CREATE TABLE transacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    titulo VARCHAR NOT NULL,
    descricao VARCHAR,
    valor DECIMAL(10,2) NOT NULL,
    tipo ENUM('receita', 'despesa') NOT NULL,
    data DATE NOT NULL,
    usuarioId UUID NOT NULL REFERENCES usuarios(id),
    categoriaId UUID REFERENCES categorias(id),
    criadoEm TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Segurança

- Senhas hash com bcrypt
- Autenticação JWT
- Middlewares de validação
- Sanitização de inputs
- CORS configurado
- Rate limiting (produção)

## 📈 Performance

- Queries otimizadas (TypeORM)
- Paginação em todas as listagens
- Índices no banco de dados
- Lazy loading no frontend
- Cache de estado (signals)

---

**Desenvolvido por**: Matheus Faustino
**Tecnologias**: Node.js, React, PostgreSQL, TypeScript
**Padrões**: REST API, Clean Architecture, Material Design
