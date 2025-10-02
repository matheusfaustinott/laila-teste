import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./database/db";
import { rotasPrincipais } from "./rotas";

// Carrega variáveis de ambiente
dotenv.config();

/**
 * Aplicação Principal do Sistema de Controle Financeiro
 *
 * Este arquivo configura e inicializa toda a aplicação Express,
 * incluindo middlewares, rotas e conexão com banco de dados.
 *
 * Princípios aplicados:
 * - Clean Architecture: separação clara de responsabilidades
 * - Error Handling: tratamento centralizado de erros
 * - Security: configurações de segurança básicas
 * - Logging: logs para debugging e monitoramento
 *
 * Tecnologias utilizadas:
 * - Express.js: framework web
 * - TypeORM: ORM para PostgreSQL
 * - JWT: autenticação stateless
 * - bcrypt: hash de senhas
 * - CORS: política de origem cruzada
 */

// Cria a instância da aplicação Express
const app = express();

/**
 * CONFIGURAÇÃO DE MIDDLEWARES GLOBAIS
 *
 * Ordem importante: middlewares são executados na ordem definida
 */

// 1. CORS - Permite requisições de diferentes origens
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Parsing de JSON - Processa requisições com content-type application/json
app.use(express.json({ limit: "10mb" }));

// 3. Parsing de URL encoded - Para formulários HTML
app.use(express.urlencoded({ extended: true }));

// 4. Logging de requisições (desenvolvimento)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

/**
 * CONFIGURAÇÃO DE CABEÇALHOS DE SEGURANÇA
 *
 * Headers básicos de segurança para proteger a API
 */
app.use((req, res, next) => {
  // Remove header que expõe tecnologia utilizada
  res.removeHeader("X-Powered-By");

  // Previne ataques de clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Previne MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Força HTTPS em produção
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});

/**
 * ROTA DE BOAS-VINDAS
 *
 * Endpoint raiz que fornece informações básicas sobre a API
 */
app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "Sistema de Controle Financeiro",
    versao: "1.0.0",
    documentacao: {
      endpoints: "/api/info",
      saude: "/api/health",
      autenticacao: "Bearer Token JWT no header Authorization",
    },
    desenvolvedor: {
      nome: "Matheus Faustino",
      linguagem: "TypeScript",
      framework: "Express.js + TypeORM",
      banco: "PostgreSQL",
    },
  });
});

/**
 * ROTAS PRINCIPAIS DA API
 *
 * Monta todas as rotas da aplicação no prefixo /api/v1
 * Estrutura:
 * - /api/auth/* - Autenticação
 * - /api/usuarios/* - Usuários
 * - /api/categorias/* - Categorias
 * - /api/transacoes/* - Transações
 */
app.use("/api", rotasPrincipais);

/**
 * MIDDLEWARE DE TRATAMENTO DE ERROS GLOBAL
 *
 * Captura todos os erros não tratados e retorna
 * uma resposta padronizada para o cliente
 */
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Erro não tratado:", err);

    // Se já foi enviada uma resposta, delega para o handler padrão do Express
    if (res.headersSent) {
      return next(err);
    }

    // Erro de validação do TypeORM
    if (err.name === "QueryFailedError") {
      return res.status(400).json({
        sucesso: false,
        erro: "Erro de validação de dados",
        detalhes: err.message,
      });
    }

    // Erro de token JWT
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        sucesso: false,
        erro: "Token inválido",
      });
    }

    // Erro genérico
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
      ...(process.env.NODE_ENV !== "production" && { detalhes: err.message }),
    });
  }
);

/**
 * MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS
 *
 * Captura todas as rotas que não foram definidas
 */
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: "Rota não encontrada",
    metodo: req.method,
    url: req.originalUrl,
    sugestao: "Verifique a documentação em /api/info",
  });
});

/**
 * FUNÇÃO DE INICIALIZAÇÃO DA APLICAÇÃO
 *
 * Configura banco de dados e inicia o servidor
 */
async function iniciarAplicacao(): Promise<void> {
  try {
    // Inicializa conexão com banco de dados
    console.log("conectando bd");
    await AppDataSource.initialize();
    console.log("bd conectado");

    // Executa migrações pendentes em produção
    if (process.env.NODE_ENV === "production") {
      console.log("rodando as migrations ");
      await AppDataSource.runMigrations();
      console.log("migrations executadas com sucesso");
    }

    // Inicia o servidor
    const porta = process.env.PORT || 3001;

    app.listen(porta, () => {
      console.log(`API: http://localhost:${porta}`);
      console.log(`Docs: http://localhost:${porta}/api/info`);
      console.log(`Health_check: http://localhost:${porta}/api/health`);
    });
  } catch (error) {
    console.error("Erro", error);
    process.exit(1);
  }
}

/**
 * TRATAMENTO DE SINAIS DO SISTEMA
 *
 * Graceful shutdown quando receber SIGTERM ou SIGINT
 */
process.on("SIGTERM", async () => {
  console.log("SIGTERM. Finalizando");

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log("encerrada.");
  }

  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT. Finalizando");

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log("encerrada.");
  }

  process.exit(0);
});

if (require.main === module) {
  iniciarAplicacao();
}

export { app, iniciarAplicacao };
