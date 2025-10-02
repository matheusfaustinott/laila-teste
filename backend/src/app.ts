import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import "reflect-metadata";
import { AppDataSource } from "./database/db";
import { rotasPrincipais } from "./rotas";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}
app.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  next();
});

app.get("/", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "rota principal",
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

app.use("/api", rotasPrincipais);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Erro não tratado:", err);
    if (res.headersSent) {
      return next(err);
    }
    if (err.name === "QueryFailedError") {
      return res.status(400).json({
        sucesso: false,
        erro: "Erro de validação de dados",
        detalhes: err.message,
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        sucesso: false,
        erro: "Token inválido",
      });
    }
    res.status(500).json({
      sucesso: false,
      erro: "Erro interno do servidor",
      ...(process.env.NODE_ENV !== "production" && { detalhes: err.message }),
    });
  }
);
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: "Rota não encontrada",
    metodo: req.method,
    url: req.originalUrl,
    sugestao: "Verifique a documentação em /api/info",
  });
});

async function iniciarAplicacao(): Promise<void> {
  try {
    console.log("conectando bd");
    await AppDataSource.initialize();
    console.log("bd conectado");
    if (process.env.NODE_ENV === "production") {
      console.log("rodando as migrations ");
      await AppDataSource.runMigrations();
      console.log("migrations executadas com sucesso");
    }
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
 * Graceful teste para estudo
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
