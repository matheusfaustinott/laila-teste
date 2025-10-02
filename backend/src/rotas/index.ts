import { Router } from "express";
import { rotasAutenticacao } from "./autenticacao";
import { rotasCategorias } from "./categoria";
import { rotasTransacoes } from "./transacao";
import { rotasUsuario } from "./usuario";

const roteadorPrincipal = Router();
roteadorPrincipal.use("/auth", rotasAutenticacao);
roteadorPrincipal.use("/usuarios", rotasUsuario);
roteadorPrincipal.use("/categorias", rotasCategorias);
roteadorPrincipal.use("/transacoes", rotasTransacoes);
roteadorPrincipal.get("/health", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API está funcionando corretamente",
    timestamp: new Date().toISOString(),
    versao: "1.0.0",
  });
});
roteadorPrincipal.get("/info", (req, res) => {
  res.json({
    sucesso: true,
    dados: {
      nome: "API",
      versao: "1.0.0",
      descricao:
        "Sistema para gerenciamento de receitas, despesas e categorias",
      endpoints: {
        autenticacao: [
          "POST /auth/registrar",
          "POST /auth/login",
          "GET /auth/perfil",
          "PUT /auth/atualizar-senha",
          "POST /auth/logout",
        ],
        usuarios: [
          "GET /usuarios/me",
          "GET /usuarios/me/estatisticas",
          "GET /usuarios/:id",
          "PUT /usuarios/:id",
          "DELETE /usuarios/:id",
        ],
        categorias: [
          "GET /categorias",
          "GET /categorias/mais-usadas",
          "GET /categorias/:id",
          "POST /categorias",
          "PUT /categorias/:id",
          "DELETE /categorias/:id",
        ],
        transacoes: [
          "GET /transacoes",
          "GET /transacoes/resumo/mensal",
          "GET /transacoes/:id",
          "POST /transacoes",
          "PUT /transacoes/:id",
          "DELETE /transacoes/:id",
        ],
      },
      autenticacao: {
        tipo: "JWT Bearer Token",
        header: "Authorization: Bearer <token>",
      },
      formatos: {
        datas: "YYYY-MM-DD",
        valores: "decimal com até 2 casas",
        paginacao: "query parameters limite e pagina",
      },
    },
    mensagem: "infos importantes",
  });
});
roteadorPrincipal.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: "Endpoint não encontrado",
    metodo: req.method,
    url: req.originalUrl,
    sugestao: "GET/api/info e veja endpoints disponíveis",
  });
});

export const rotasPrincipais = roteadorPrincipal;
