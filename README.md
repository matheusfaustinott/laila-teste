# Controle Financeiro Pessoal

Sistema completo de gestão financeira pessoal construído com **Node.js**, **React** e **PostgreSQL**.

## Instalação e Execução

### Opção 1: Docker - produção

**Requisito único**: Docker e Docker Compose instalados apenas.

```bash
# Clone o repositório
git clone https://github.com/matheusfaustinott/laila-teste.git
cd laila-teste

# Execute (o .env já está configurado para desenvolvimento)
docker-compose up -d

#logs em tempo real
docker-compose up

# Para rebuild
docker-compose down -v && docker-compose up --build
```

> **Aviso importante**: Se encontrar erro com `docker-compose up --build`, use primeiro `docker-compose build` e depois `docker-compose up -d` para uma execução mais estável.

### Opção 2: Desenvolvedor

**Requisitos**: Node.js 18+, Docker (apenas para PostgreSQL).

```bash
# Clone o repositório
git clone https://github.com/matheusfaustinott/laila-teste.git
cd laila-teste

# 1. Suba apenas o PostgreSQL via Docker
docker-compose -f docker-compose.dev.yml up -d

# 2. Aguarde o banco estar pronto (aguarde ~10 segundos)
docker-compose -f docker-compose.dev.yml logs postgres

# 3. Configure e execute o backend
cd backend
npm install

# Execute as migrações para criar tabelas
npm run migration:run

# Inicie o servidor backend
npm run dev

# 4. Execute o frontend (novo terminal)
cd frontend
npm install
npm start
```

**URLs de Acesso:**

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Documentação**: http://localhost:3001/api/info

### Estrutura Docker

```
├── docker-compose.yml
├── backend/Dockerfile
└── frontend/Dockerfile
```

## Stack

**Backend:**

- Node.js 18 + TypeScript
- Express.js + CORS
- TypeORM + PostgreSQL
- JWT Authentication
- Bcrypt para senhas

**Frontend:**

- React 18
- Material-UI v5
- @preact/signals
- Axios

**DevOps:**

- Docker multi-stage builds
- PostgreSQL containerizado
- Nginx para servir o React
- Healthchecks automáticos

## Comandos Úteis

### Docker

```bash
# Docker completo (produção)
docker-compose up -d
docker-compose logs -f

# Apenas PostgreSQL (desenvolvimento)
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs postgres

# Ver status dos containers
docker-compose ps
docker-compose -f docker-compose.dev.yml ps

# Parar containers
docker-compose down                        # Produção
docker-compose -f docker-compose.dev.yml down  # Desenvolvimento

# Reset completo do banco de desenvolvimento
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d

# Verificar se está funcionando
curl http://localhost:3001/api/health
curl http://localhost:3000
```

### Desenvolvimento

```bash
# PostgreSQL (desenvolvimento)
docker-compose -f docker-compose.dev.yml up -d     # Subir banco
docker-compose -f docker-compose.dev.yml logs postgres  # Ver logs do banco
docker-compose -f docker-compose.dev.yml down      # Parar banco
docker-compose -f docker-compose.dev.yml down -v   # Reset completo (apaga dados)

# Verificar se banco está pronto
docker-compose -f docker-compose.dev.yml ps

# Migrações do banco (após npm install no backend)
cd backend
npm run migration:run           # Executar migrações (criar tabelas)
npm run migration:generate      # Gerar nova migração
npm run migration:revert        # Reverter última migração

# Backend
npm run dev          # Servidor em modo watch
npm run build        # Build para produção

# Frontend
cd frontend
npm start            # Servidor de desenvolvimento
npm run build        # Build para produção
```

## Troubleshooting

### Docker

**Problema**: Erro `'ContainerConfig'` no docker-compose up --build

**Solução**:

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

**Verificar configuração do .env**:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=admin
DB_PASSWORD=admin
DB_DATABASE=laila
```

## Endpoints

### Autenticação

- `POST /api/auth/registrar` - Criar usuário
- `POST /api/auth/login` - Login

### Lançamentos

- `GET /api/transacoes` - Listar
- `POST /api/transacoes` - Criar
- `PUT /api/transacoes/:id` - Atualizar
- `DELETE /api/transacoes/:id` - Excluir
- `GET /api/transacoes/resumo/mensal` - Resumo mensal

### Categorias

- `GET /api/categorias` - Listar por usuário
- `POST /api/categorias` - Criar
- `PUT /api/categorias/:id` - Atualizar
- `DELETE /api/categorias/:id` - Excluir

## Schema do Banco

```sql
-- Usuários
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nomeCompleto VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    senha VARCHAR NOT NULL,
    criadoEm TIMESTAMP DEFAULT NOW()
);

-- Categorias
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR NOT NULL,
    descricao VARCHAR,
    usuarioId UUID NOT NULL REFERENCES usuarios(id),
    criadoEm TIMESTAMP DEFAULT NOW()
);

-- Transações
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

**Desenvolvido por**: Matheus Faustino
