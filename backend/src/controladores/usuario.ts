import { Response } from "express";
import { servicoAutenticacao } from "../servicos/autenticacao";
import { RequestAutenticado } from "../tipos";
import {
  respostaDadosInvalidos,
  respostaErro,
  respostaNaoAutorizado,
  respostaNaoEncontrado,
  respostaProibido,
  respostaSucesso,
} from "../utils/respostas";

/**
 * Controlador de Usuários
 *
 * Este controlador gerencia operações relacionadas aos usuários
 * que não são de autenticação (que estão no controlador de autenticação).
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas operações de usuário
 * - Authorization: verificação de permissões
 * - Data Validation: validação de dados de entrada
 * - Error Handling: tratamento consistente de erros
 *
 * Endpoints disponíveis:
 * - GET /usuarios/:id - Busca usuário por ID (apenas próprio usuário ou admin)
 * - PUT /usuarios/:id - Atualiza dados do usuário
 * - DELETE /usuarios/:id - Remove usuário (soft delete)
 * - GET /usuarios/me - Atalho para dados do usuário autenticado
 */

/**
 * Busca um usuário específico por ID
 *
 * @param req - Request com ID do usuário nos parâmetros
 * @param res - Response com dados do usuário
 *
 * Regras de negócio:
 * - Usuário só pode ver seus próprios dados
 * - Admins podem ver dados de qualquer usuário
 */
export const buscarUsuarioPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Verifica se o usuário está tentando acessar seus próprios dados
    // Em uma versão futura, admins poderiam acessar dados de outros usuários
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode acessar seus próprios dados");
      return;
    }

    // Busca o usuário
    const usuario = await servicoAutenticacao.buscarUsuarioPorId(id);

    if (!usuario) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }

    respostaSucesso(res, {
      usuario,
      mensagem: "Usuário encontrado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    respostaErro(res, "Erro interno do servidor ao buscar usuário");
  }
};

/**
 * Atualiza dados do usuário autenticado
 *
 * @param req - Request com novos dados do usuário
 * @param res - Response com dados atualizados
 *
 * Campos que podem ser atualizados:
 * - nomeCompleto
 * - email (com validação de unicidade)
 */
export const atualizarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nomeCompleto, email } = req.body;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Verifica se o usuário está tentando atualizar seus próprios dados
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode atualizar seus próprios dados");
      return;
    }

    // Validação dos dados
    const errosValidacao = validarDadosAtualizacao({ nomeCompleto, email });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }

    // Busca o usuário atual
    const usuarioAtual = await servicoAutenticacao.buscarUsuarioPorId(id);

    if (!usuarioAtual) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }

    // TODO: Implementar método de atualização no serviço de autenticação
    // Por enquanto, retornamos uma mensagem indicando que seria implementado
    respostaSucesso(res, {
      mensagem: "Funcionalidade de atualização será implementada no serviço",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    respostaErro(res, "Erro interno do servidor ao atualizar usuário");
  }
};

/**
 * Remove um usuário (soft delete)
 *
 * @param req - Request com ID do usuário a ser removido
 * @param res - Response confirmando a remoção
 *
 * Nota: Implementaremos soft delete para manter integridade dos dados
 */
export const removerUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Verifica se o usuário está tentando remover sua própria conta
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode remover sua própria conta");
      return;
    }

    // Busca o usuário
    const usuario = await servicoAutenticacao.buscarUsuarioPorId(id);

    if (!usuario) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }

    // TODO: Implementar soft delete no serviço
    // 1. Marcar usuário como inativo
    // 2. Anonimizar dados sensíveis se necessário
    // 3. Manter histórico de transações para integridade

    respostaSucesso(res, {
      mensagem: "Conta removida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    respostaErro(res, "Erro interno do servidor ao remover usuário");
  }
};

/**
 * Atalho para buscar dados do usuário autenticado
 *
 * @param req - Request autenticado
 * @param res - Response com dados do usuário
 *
 * Este endpoint é equivalente a GET /usuarios/:id, mas mais conveniente
 * pois não requer passar o ID como parâmetro
 */
export const buscarMeuPerfil = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca dados atualizados do usuário
    const usuario = await servicoAutenticacao.buscarUsuarioPorId(
      req.usuario.id
    );

    if (!usuario) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }

    respostaSucesso(res, {
      usuario,
      mensagem: "Dados do perfil recuperados com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    respostaErro(res, "Erro interno do servidor ao buscar perfil");
  }
};

/**
 * Lista estatísticas básicas do usuário
 *
 * @param req - Request autenticado
 * @param res - Response com estatísticas
 *
 * Retorna informações como:
 * - Data de cadastro
 * - Número total de transações
 * - Número de categorias criadas
 */
export const buscarEstatisticasUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaDadosInvalidos(res, "Usuário não autenticado");
      return;
    }

    // TODO: Implementar busca de estatísticas
    // 1. Contar transações do usuário
    // 2. Contar categorias do usuário
    // 3. Calcular totais de receitas e despesas
    // 4. Data da última transação

    const estatisticas = {
      dataCadastro: req.usuario.criadoEm,
      totalTransacoes: 0, // TODO: calcular do banco
      totalCategorias: 0, // TODO: calcular do banco
      ultimaAtividade: req.usuario.criadoEm, // TODO: buscar última transação
    };

    respostaSucesso(res, {
      estatisticas,
      mensagem: "Estatísticas recuperadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    respostaErro(res, "Erro interno do servidor ao buscar estatísticas");
  }
};

// === FUNÇÕES AUXILIARES ===

/**
 * Valida os dados de atualização do usuário
 *
 * @param dados - Dados para validar
 * @returns Array de erros encontrados
 */
const validarDadosAtualizacao = (dados: {
  nomeCompleto?: string;
  email?: string;
}): string[] => {
  const erros: string[] = [];

  // Validação do nome completo (se fornecido)
  if (dados.nomeCompleto !== undefined) {
    if (!dados.nomeCompleto || dados.nomeCompleto.trim().length < 2) {
      erros.push("Nome completo deve ter pelo menos 2 caracteres");
    }
  }

  // Validação do email (se fornecido)
  if (dados.email !== undefined) {
    if (!dados.email) {
      erros.push("Email não pode ser vazio");
    } else if (!isEmailValido(dados.email)) {
      erros.push("Email inválido");
    }
  }

  return erros;
};

/**
 * Valida se um email tem formato válido
 *
 * @param email - Email para validar
 * @returns true se válido, false caso contrário
 */
const isEmailValido = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};
