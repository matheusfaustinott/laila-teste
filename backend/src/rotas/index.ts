import { Router } from "express";
import { rotasAutenticacao } from "./autenticacao";
import { rotasCategorias } from "./categoria";
import { rotasTransacoes } from "./transacao";
import { rotasUsuario } from "./usuario";

/**
 * Roteador Principal da API
 *
 * Este arquivo centraliza todas as rotas da aplicação,
 * organizando-as por módulos funcionais.
 *
 * Princípios aplicados:
 * - Separation of Concerns: cada módulo tem suas próprias rotas
 * - Modularity: facilita manutenção e escalabilidade
 * - RESTful Design: seguindo convenções REST
 * - Versioning Ready: preparado para versionamento da API
 *
 * Estrutura da API:
 * /api/v1/auth/*       - Autenticação e autorização
 * /api/v1/usuarios/*   - Gerenciamento de usuários
 * /api/v1/categorias/* - Gerenciamento de categorias
 * /api/v1/transacoes/* - Gerenciamento de transações
 */

// Cria uma instância do router principal
const roteadorPrincipal = Router();

/**
 * ROTAS DE AUTENTICAÇÃO
 *
 * Prefixo: /auth
 *
 * Rotas disponíveis:
 * - POST /auth/registrar - Registro de novo usuário
 * - POST /auth/login - Login de usuário
 * - GET /auth/perfil - Dados do usuário autenticado
 * - PUT /auth/atualizar-senha - Atualização de senha
 * - POST /auth/logout - Logout do usuário
 */
roteadorPrincipal.use("/auth", rotasAutenticacao);

/**
 * ROTAS DE USUÁRIOS
 *
 * Prefixo: /usuarios
 *
 * Rotas disponíveis:
 * - GET /usuarios/me - Atalho para dados do usuário autenticado
 * - GET /usuarios/me/estatisticas - Estatísticas do usuário
 * - GET /usuarios/:id - Buscar usuário por ID
 * - PUT /usuarios/:id - Atualizar dados do usuário
 * - DELETE /usuarios/:id - Remover conta do usuário
 */
roteadorPrincipal.use("/usuarios", rotasUsuario);

/**
 * ROTAS DE CATEGORIAS
 *
 * Prefixo: /categorias
 *
 * Rotas disponíveis:
 * - GET /categorias - Listar categorias do usuário
 * - GET /categorias/mais-usadas - Categorias mais utilizadas
 * - GET /categorias/:id - Buscar categoria por ID
 * - POST /categorias - Criar nova categoria
 * - PUT /categorias/:id - Atualizar categoria
 * - DELETE /categorias/:id - Remover categoria
 */
roteadorPrincipal.use("/categorias", rotasCategorias);

/**
 * ROTAS DE TRANSAÇÕES
 *
 * Prefixo: /transacoes
 *
 * Rotas disponíveis:
 * - GET /transacoes - Listar transações do usuário
 * - GET /transacoes/resumo/mensal - Resumo mensal de transações
 * - GET /transacoes/:id - Buscar transação por ID
 * - POST /transacoes - Criar nova transação
 * - PUT /transacoes/:id - Atualizar transação
 * - DELETE /transacoes/:id - Remover transação
 */
roteadorPrincipal.use("/transacoes", rotasTransacoes);

/**
 * ROTA DE SAÚDE DA API
 *
 * Endpoint simples para verificar se a API está funcionando
 * Útil para monitoramento e load balancers
 */
roteadorPrincipal.get("/health", (req, res) => {
  res.json({
    sucesso: true,
    mensagem: "API está funcionando corretamente",
    timestamp: new Date().toISOString(),
    versao: "1.0.0",
  });
});

/**
 * ROTA DE INFORMAÇÕES DA API
 *
 * Fornece informações sobre a API e suas funcionalidades
 */
roteadorPrincipal.get("/info", (req, res) => {
  res.json({
    sucesso: true,
    dados: {
      nome: "API de Controle Financeiro Pessoal",
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
    mensagem: "Informações da API recuperadas com sucesso",
  });
});

/**
 * MIDDLEWARE DE ROTA NÃO ENCONTRADA
 *
 * Captura todas as rotas que não foram definidas
 * e retorna uma resposta padronizada de erro 404
 */
roteadorPrincipal.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    erro: "Endpoint não encontrado",
    metodo: req.method,
    url: req.originalUrl,
    sugestao: "GET/api/info e veja endpoints disponíveis",
  });
});

/**
 * Exporta o roteador principal para ser usado na aplicação
 *
 * Este roteador será montado em /api/v1 na aplicação,
 * criando a estrutura final:
 * - /api/v1/auth/*
 * - /api/v1/usuarios/*
 * - /api/v1/categorias/*
 * - /api/v1/transacoes/*
 * - /api/v1/health
 * - /api/v1/info
 */
export const rotasPrincipais = roteadorPrincipal;
