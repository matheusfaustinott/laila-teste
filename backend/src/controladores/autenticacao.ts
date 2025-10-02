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
 * Controlador de Autenticação
 *
 * Este controlador é responsável por gerenciar todas as operações
 * relacionadas à autenticação de usuários.
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas lógica de controle de autenticação
 * - Separation of Concerns: delega a lógica de negócio para o serviço
 * - Error Handling: trata erros de forma consistente
 * - Validation: valida dados de entrada
 *
 * Endpoints disponíveis:
 * - POST /registrar - Registra novo usuário
 * - POST /login - Autentica usuário
 * - GET /perfil - Busca dados do usuário autenticado
 * - PUT /atualizar-senha - Atualiza senha do usuário
 */

/**
 * Registra um novo usuário no sistema
 *
 * @param req - Request com dados do usuário (nomeCompleto, email, senha)
 * @param res - Response com dados do usuário criado
 *
 * Validações:
 * - Nome completo obrigatório (mínimo 2 caracteres)
 * - Email válido e único
 * - Senha forte (mínimo 6 caracteres)
 */
export const registrarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { nomeCompleto, email, senha }: CriarUsuarioDto = req.body;

    // Validação dos dados de entrada
    const errosValidacao = validarDadosRegistro({ nomeCompleto, email, senha });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }

    // Chama o serviço para registrar o usuário
    const usuario = await servicoAutenticacao.registrarUsuario({
      nomeCompleto,
      email,
      senha,
    });

    // Retorna sucesso com dados do usuário (sem senha)
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
      // Erros conhecidos (ex: email já existe)
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
 * Autentica um usuário existente
 *
 * @param req - Request com credenciais (email, senha)
 * @param res - Response com token JWT e dados do usuário
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

    // Retorna sucesso com token e dados do usuário
    respostaSucesso(res, {
      ...resultado,
      mensagem: "Login realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer login:", error);

    if (error instanceof Error) {
      // Erros de credenciais inválidas
      if (error.message.includes("Credenciais inválidas")) {
        respostaNaoAutorizado(res, "Email ou senha incorretos");
        return;
      }
    }

    respostaErro(res, "Erro interno do servidor ao fazer login");
  }
};

/**
 * Busca dados do perfil do usuário autenticado
 *
 * @param req - Request autenticado (middleware já validou o token)
 * @param res - Response com dados do usuário
 */
export const buscarPerfil = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    // O middleware de autenticação já validou e adicionou o usuário ao request
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca dados atualizados do usuário (caso tenham mudado)
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
 * Atualiza a senha do usuário autenticado
 *
 * @param req - Request com senhaAtual e novaSenha
 * @param res - Response confirmando a atualização
 */
export const atualizarSenha = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Validação dos dados
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

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Chama o serviço para atualizar a senha
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

/**
 * Endpoint para logout (lado cliente)
 *
 * Como JWT é stateless, o logout é feito no lado cliente
 * removendo o token. Este endpoint serve apenas para
 * confirmar o logout e potencialmente fazer limpezas.
 */
export const deslogarUsuario = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    // Em uma implementação mais avançada, você poderia:
    // 1. Adicionar o token a uma blacklist
    // 2. Registrar o logout em logs de auditoria
    // 3. Limpar sessões relacionadas

    respostaSucesso(res, {
      mensagem: "Logout realizado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
    respostaErro(res, "Erro interno do servidor ao fazer logout");
  }
};

// === FUNÇÕES AUXILIARES ===

/**
 * Valida os dados de registro de usuário
 *
 * @param dados - Dados do usuário para validar
 * @returns Array de erros encontrados
 */
const validarDadosRegistro = (dados: CriarUsuarioDto): string[] => {
  const erros: string[] = [];

  // Validação do nome completo
  if (!dados.nomeCompleto || dados.nomeCompleto.trim().length < 2) {
    erros.push("Nome completo deve ter pelo menos 2 caracteres");
  }

  // Validação do email
  if (!dados.email) {
    erros.push("Email é obrigatório");
  } else if (!isEmailValido(dados.email)) {
    erros.push("Email inválido");
  }

  // Validação da senha
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
 * Valida se um email tem formato válido
 *
 * @param email - Email para validar
 * @returns true se válido, false caso contrário
 */
const isEmailValido = (email: string): boolean => {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
};

/**
 * Verifica se uma senha é considerada forte
 *
 * @param senha - Senha para validar
 * @returns true se forte, false caso contrário
 */
const isSenhaForte = (senha: string): boolean => {
  // Pelo menos uma letra e um número
  const temLetra = /[a-zA-Z]/.test(senha);
  const temNumero = /\d/.test(senha);

  return temLetra && temNumero;
};
