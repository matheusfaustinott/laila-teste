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
 *
 * @param req
 * @param res
 *
 */
export const buscarUsuarioPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode acessar seus próprios dados");
      return;
    }
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
 *
 * @param req
 * @param res
 *
 */
export const atualizarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { nomeCompleto, email } = req.body;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode atualizar seus próprios dados");
      return;
    }
    const errosValidacao = validarDadosAtualizacao({ nomeCompleto, email });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
    const usuarioAtual = await servicoAutenticacao.buscarUsuarioPorId(id);

    if (!usuarioAtual) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }
    // não vamos usar update de user
    respostaSucesso(res, {
      mensagem: "atualizado",
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    respostaErro(res, "Erro interno do servidor ao atualizar usuário");
  }
};

/**
 *
 * @param req
 * @param res
 *
 */
export const removerUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    // aqui com func de adm poderia remover qualquer usuário
    if (id !== req.usuario.id) {
      respostaProibido(res, "Você só pode remover sua própria conta");
      return;
    }
    const usuario = await servicoAutenticacao.buscarUsuarioPorId(id);

    if (!usuario) {
      respostaNaoEncontrado(res, "Usuário não encontrado");
      return;
    }
    // daria pra implementar soft delete aqui futuramente, estrutura pronta já

    respostaSucesso(res, {
      mensagem: "Conta removida com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    respostaErro(res, "Erro interno do servidor ao remover usuário");
  }
};

/**
 *
 * @param req
 * @param res
 */
export const buscarMeuPerfil = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
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
 *
 * @param req
 * @param res
 *
 */
export const buscarEstatisticasUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    if (!req.usuario) {
      respostaDadosInvalidos(res, "Usuário não autenticado");
      return;
    }
    // poderia ser implementado futuramente para caracteristicas e controle do próprio usuário

    const estatisticas = {
      dataCadastro: req.usuario.criadoEm,
      totalTransacoes: 0,
      totalCategorias: 0,
      ultimaAtividade: req.usuario.criadoEm,
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

/**
 *
 * @param dados
 * @returns
 */
const validarDadosAtualizacao = (dados: {
  nomeCompleto?: string;
  email?: string;
}): string[] => {
  const erros: string[] = [];
  if (dados.nomeCompleto !== undefined) {
    if (!dados.nomeCompleto || dados.nomeCompleto.trim().length < 2) {
      erros.push("Nome completo deve ter pelo menos 2 caracteres");
    }
  }
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
 *
 * @param email
 * @returns
 */
const isEmailValido = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};
