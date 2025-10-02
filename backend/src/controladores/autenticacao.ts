import { Response } from "express";
import { servicoAutenticacao } from "../servicos/autenticacao";
import { CriarUsuarioDto, LoginDto, RequestAutenticado } from "../tipos";
import {
  respostaConflito,
  respostaCriado,
  respostaDadosInvalidos,
  respostaErro,
  respostaNaoAutorizado,
  respostaSucesso,
} from "../utils/respostas";

/**
 * @param req
 * @param res
 */
export const registrarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { nomeCompleto, email, senha }: CriarUsuarioDto = req.body;
    const errosValidacao = validarDadosRegistro({ nomeCompleto, email, senha });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
    const usuario = await servicoAutenticacao.registrarUsuario({
      nomeCompleto,
      email,
      senha,
    });
    // resposta
    respostaCriado(
      res,
      {
        usuario,
        mensagem: "Usuário registrado com sucesso",
      },
      "Usuário registrado com sucesso"
    );
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);

    if (error instanceof Error) {
      if (error.message.includes("Email já está em uso")) {
        respostaConflito(
          res,
          "Email",
          "Este email já está sendo utilizado por outro usuário"
        );
        return;
      }
    }

    respostaErro(res, "Erro interno do servidor ao registrar usuário");
  }
};

/**
 *
 * @param req
 * @param res
 */
export const logarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { email, senha }: LoginDto = req.body;

    if (!email || !senha) {
      respostaDadosInvalidos(res, "Email e senha são obrigatórios");
      return;
    }

    if (!isEmailValido(email)) {
      respostaDadosInvalidos(res, "Email inválido");
      return;
    }
    const resultado = await servicoAutenticacao.autenticarUsuario({
      email,
      senha,
    });
    respostaSucesso(res, {
      ...resultado,
      mensagem: "Login realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    if (error instanceof Error) {
      if (error.message.includes("Credenciais inválidas")) {
        respostaNaoAutorizado(res, "Email ou senha incorretos");
        return;
      }
    }
    respostaErro(res, "Erro interno do servidor ao fazer login");
  }
};

/**
 * @param req
 * @param res
 */
export const buscarPerfil = async (
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
      respostaNaoAutorizado(res, "Usuário não encontrado");
      return;
    }

    respostaSucesso(res, {
      usuario,
      mensagem: "Perfil recuperado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    respostaErro(res, "Erro interno do servidor ao buscar perfil");
  }
};

/**
 * Atualiza a senha só pra fazer parte do crud completo, não vou implementar no front
 *
 * @param req -
 * @param res -
 */
export const atualizarSenha = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { senhaAtual, novaSenha } = req.body;
    if (!senhaAtual || !novaSenha) {
      respostaDadosInvalidos(res, "Senha atual e nova senha são obrigatórias");
      return;
    }

    if (novaSenha.length < 6) {
      respostaDadosInvalidos(
        res,
        "Nova senha deve ter pelo menos 6 caracteres"
      );
      return;
    }

    if (senhaAtual === novaSenha) {
      respostaDadosInvalidos(
        res,
        "Nova senha deve ser diferente da senha atual"
      );
      return;
    }
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    await servicoAutenticacao.atualizarSenha(
      req.usuario.id,
      senhaAtual,
      novaSenha
    );

    respostaSucesso(res, {
      mensagem: "Senha atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar senha:", error);

    if (error instanceof Error) {
      if (error.message.includes("Senha atual incorreta")) {
        respostaDadosInvalidos(res, "Senha atual incorreta");
        return;
      }
    }

    respostaErro(res, "Erro interno do servidor ao atualizar senha");
  }
};

export const deslogarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    // não vou implementar nada aqui, nivel de complexidade do projeto é baixo....
    respostaSucesso(res, {
      mensagem: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    respostaErro(res, "Erro interno do servidor ao fazer logout");
  }
};

/**
 * Valida os dados de registro de usuário
 *
 * @param dados
 * @returns
 */
const validarDadosRegistro = (dados: CriarUsuarioDto): string[] => {
  const erros: string[] = [];
  if (!dados.nomeCompleto || dados.nomeCompleto.trim().length < 2) {
    erros.push("Nome completo deve ter pelo menos 2 caracteres");
  }
  if (!dados.email) {
    erros.push("Email é obrigatório");
  } else if (!isEmailValido(dados.email)) {
    erros.push("Email inválido");
  }
  if (!dados.senha) {
    erros.push("Senha é obrigatória");
  } else if (dados.senha.length < 6) {
    erros.push("Senha deve ter pelo menos 6 caracteres");
  } else if (!isSenhaForte(dados.senha)) {
    erros.push("Senha deve conter pelo menos uma letra e um número");
  }

  return erros;
};

/**

 * @param email
 * @returns
 */
const isEmailValido = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};

/**
 * @param senha
 * @returns
 */
const isSenhaForte = (senha: string): boolean => {
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /\d/.test(senha);

  return temLetra && temNumero;
};
