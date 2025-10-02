import { NextFunction, Response } from "express";
import { servicoAutenticacao } from "../servicos/autenticacao";
import { RequestAutenticado } from "../tipos";
import { respostaNaoAutorizado } from "../utils/respostas";

/**
 * @param req
 * @param res
 * @param next
 */
export const verificarAutenticacao = async (
  req: RequestAutenticado,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      respostaNaoAutorizado(res, "Token de acesso não fornecido");
      return;
    }
    const partesHeader = authHeader.split(" ");

    if (partesHeader.length !== 2 || partesHeader[0] !== "Bearer") {
      respostaNaoAutorizado(
        res,
        "Formato do token inválido. Use: Bearer <token>"
      );
      return;
    }

    const token = partesHeader[1];
    if (!token) {
      respostaNaoAutorizado(res, "Token não fornecido");
      return;
    }
    const dadosToken = await servicoAutenticacao.verificarToken(token);
    const usuario = await servicoAutenticacao.buscarUsuarioPorId(
      dadosToken.usuarioId
    );

    if (!usuario) {
      respostaNaoAutorizado(res, "Usuário não encontrado");
      return;
    }
    req.usuario = usuario;
    req.tokenPayload = dadosToken;
    next();
  } catch (error) {
    console.error("Erro na autenticação:", error);
    if (error instanceof Error) {
      respostaNaoAutorizado(res, error.message);
    } else {
      respostaNaoAutorizado(res, "Erro interno de autenticação");
    }
  }
};
