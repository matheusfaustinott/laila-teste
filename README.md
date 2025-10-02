# Controle Financeiro Pessoal

Sistema completo de gestão financeira pessoal construído com **Node.js**, **React** e **PostgreSQL**.

## (Teste Técnico)

**Requisito único**: Docker e Docker Compose instalados apenas.

```bash
# Clone o repositório
git clone https://github.com/matheusfaustinott/teste-laila.git
cd teste-laila

# Execute (o .env já está configurado para desenvolvimento)
docker-compose up -d

#logs em tempo real
docker-compose up

# Para rebuild
docker-compose down -v && docker-compose up --build
```

> **Aviso importante**: Se encontrar erro com `docker-compose up --build`, use primeiro `docker-compose build` e depois `docker-compose up -d` para uma execução mais estável.

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Documentação**: http://localhost:3001/api/info

### Docker

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

# Reset completo
docker-compose down -v && docker-compose up --build

# Rebuild específico
docker-compose build backend
docker-compose build frontend
docker-compose up -d

# Verificar se está funcionando
curl http://localhost:3001/api/health
curl http://localhost:3000
```

## Troubleshooting

**Problema**: Erro `'ContainerConfig'` no docker-compose up --build -> isso se da pela versão do docker-compose

**Solução**:

```bash
docker-compose down -v
docker-compose build
docker-compose up -d
```

**Problema**: Containers não iniciam
**Solução**:

```bash
docker-compose ps
docker-compose logs <nome-servico>
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
