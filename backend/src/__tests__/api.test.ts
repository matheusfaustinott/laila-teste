import express, { Request, Response } from "express";
import request from "supertest";

const criarAppTeste = () => {
  const app = express();
  app.use(express.json());

  // Health check
  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", message: "API funcionando" });
  });

  // Endpoint de registro
  app.post("/api/usuarios/registro", (req: Request, res: Response) => {
    const { email, senha, nomeCompleto } = req.body;

    if (!email || !senha || !nomeCompleto) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Dados obrigatórios não fornecidos",
      });
    }

    if (email === "teteu@existe.com") {
      return res.status(409).json({
        sucesso: false,
        mensagem: "Email já existe",
      });
    }

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário criado",
      dados: { id: "123", email, nomeCompleto },
    });
  });

  // Endpoint de login
  app.post("/api/usuarios/login", (req: Request, res: Response) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        sucesso: false,
        mensagem: "Email e senha obrigatórios",
      });
    }

    if (email === "matheus@dev.com" && senha === "teteu123") {
      return res.status(200).json({
        sucesso: true,
        mensagem: "Login realizado",
        dados: {
          id: "1",
          email,
          token: "fake-jwt-token",
        },
      });
    }

    res.status(401).json({
      sucesso: false,
      mensagem: "Credenciais inválidas",
    });
  });

  // Endpoint de transações
  app.get("/api/transacoes", (req: Request, res: Response) => {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({
        sucesso: false,
        mensagem: "Token requerido",
      });
    }

    res.status(200).json({
      sucesso: true,
      dados: [
        {
          id: "1",
          descricao: "Salário",
          valor: 5000,
          tipo: "RECEITA",
        },
        {
          id: "2",
          descricao: "Skins no lol",
          valor: 250,
          tipo: "DESPESA",
        },
      ],
    });
  });

  return app;
};

const validarEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validarSenha = (senha: string): boolean => {
  return senha.length >= 6;
};

describe("Testes API", () => {
  let app: express.Application;

  beforeAll(() => {
    app = criarAppTeste();
  });

  describe("Health Check", () => {
    it("deve retornar status ok", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("ok");
      expect(response.body.message).toBe("API funcionando");
    });
  });

  describe("Registro de Usuário", () => {
    it("deve criar usuário com dados válidos", async () => {
      const dadosUsuario = {
        nomeCompleto: "Matheus Faustino",
        email: "matheus@test.com",
        senha: "teteu123",
      };

      const response = await request(app)
        .post("/api/usuarios/registro")
        .send(dadosUsuario)
        .expect(201);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.mensagem).toBe("Usuário criado");
      expect(response.body.dados.email).toBe(dadosUsuario.email);
    });

    it("deve rejeitar dados incompletos", async () => {
      const response = await request(app)
        .post("/api/usuarios/registro")
        .send({ email: "teteu@test.com" })
        .expect(400);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toBe("Dados obrigatórios não fornecidos");
    });

    it("deve rejeitar email já existente", async () => {
      const response = await request(app)
        .post("/api/usuarios/registro")
        .send({
          nomeCompleto: "Teteu",
          email: "teteu@existe.com",
          senha: "matheus123",
        })
        .expect(409);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toBe("Email já existe");
    });
  });

  describe("Login de Usuário", () => {
    it("deve fazer login com credenciais válidas", async () => {
      const response = await request(app)
        .post("/api/usuarios/login")
        .send({
          email: "matheus@dev.com",
          senha: "teteu123",
        })
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(response.body.mensagem).toBe("Login realizado");
      expect(response.body.dados.token).toBe("fake-jwt-token");
    });

    it("deve rejeitar credenciais inválidas", async () => {
      const response = await request(app)
        .post("/api/usuarios/login")
        .send({
          email: "teteu@wrong.com",
          senha: "senhaerrada",
        })
        .expect(401);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toBe("Credenciais inválidas");
    });

    it("deve rejeitar dados incompletos", async () => {
      const response = await request(app)
        .post("/api/usuarios/login")
        .send({ email: "matheus@incomplete.com" })
        .expect(400);

      expect(response.body.sucesso).toBe(false);
    });
  });

  describe("Transações", () => {
    it("deve listar transações com token", async () => {
      const response = await request(app)
        .get("/api/transacoes")
        .set("Authorization", "Bearer fake-token")
        .expect(200);

      expect(response.body.sucesso).toBe(true);
      expect(Array.isArray(response.body.dados)).toBe(true);
      expect(response.body.dados).toHaveLength(2);
      expect(response.body.dados[0].descricao).toBe("Salário");
    });

    it("deve rejeitar acesso sem token", async () => {
      const response = await request(app).get("/api/transacoes").expect(401);

      expect(response.body.sucesso).toBe(false);
      expect(response.body.mensagem).toBe("Token requerido");
    });
  });

  describe("Validações", () => {
    it("deve validar emails corretamente", () => {
      expect(validarEmail("matheus@email.com")).toBe(true);
      expect(validarEmail("teteu@dev.com")).toBe(true);
      expect(validarEmail("email-invalido")).toBe(false);
      expect(validarEmail("")).toBe(false);
    });

    it("deve validar senhas corretamente", () => {
      expect(validarSenha("teteu123")).toBe(true);
      expect(validarSenha("matheus456")).toBe(true);
      expect(validarSenha("123")).toBe(false);
      expect(validarSenha("")).toBe(false);
    });
  });
});
