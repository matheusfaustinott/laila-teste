import { Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { RespostaApi } from "../tipos";

/**
 * @param res
 * @param dados
 * @param statusCode
 * @param mensagem
 * @returns
 */
export const respostaSucesso = <T>(
  res: Response,
  dados: T,
  statusCode: StatusCodes = StatusCodes.OK,
  mensagem?: string
): Response => {
  const resposta: RespostaApi<T> = {
    sucesso: true,
    mensagem: mensagem || "Operação executada com sucesso",
    dados,
  };

  return res.status(statusCode).json(resposta);
};

/**
 * @param res
 * @param erro
 * @param mensagem
 * @param statusCode
 * @returns
 */
export const respostaErro = (
  res: Response,
  erro: string,
  mensagem: string = "Erro interno do servidor",
  statusCode: StatusCodes = StatusCodes.INTERNAL_SERVER_ERROR
): Response => {
  const resposta: RespostaApi = {
    sucesso: false,
    mensagem,
    erro,
  };

  return res.status(statusCode).json(resposta);
};

/**
 * @param res
 * @param recurso
 * @returns
 */
export const respostaNaoEncontrado = (
  res: Response,
  recurso: string = "Recurso"
): Response => {
  return respostaErro(
    res,
    `${recurso} não localizado na base de dados`,
    `${recurso} solicitado não existe ou foi removido`,
    StatusCodes.NOT_FOUND
  );
};

/**
 * @param res
 * @param mensagem
 * @returns
 */
export const respostaNaoAutorizado = (
  res: Response,
  mensagem: string = "Credenciais inválidas ou token expirado"
): Response => {
  return respostaErro(
    res,
    ReasonPhrases.UNAUTHORIZED,
    mensagem,
    StatusCodes.UNAUTHORIZED
  );
};

/**
 * @param res
 * @param mensagem
 * @returns
 */
export const respostaProibido = (
  res: Response,
  mensagem: string = "Acesso negado para este recurso"
): Response => {
  return respostaErro(
    res,
    ReasonPhrases.FORBIDDEN,
    mensagem,
    StatusCodes.FORBIDDEN
  );
};

/**
 * @param res
 * @param detalhes
 * @param mensagem
 * @returns
 */
export const respostaDadosInvalidos = (
  res: Response,
  detalhes: string | string[],
  mensagem: string = "Dados fornecidos não atendem aos critérios de validação"
): Response => {
  const resposta: RespostaApi = {
    sucesso: false,
    mensagem,
    erro: Array.isArray(detalhes) ? detalhes.join("; ") : detalhes,
    ...(Array.isArray(detalhes) && { detalhes }),
  };
  return res.status(StatusCodes.BAD_REQUEST).json(resposta);
};

/**
 * @param res
 * @param recurso
 * @param detalhes
 * @returns
 */
export const respostaConflito = (
  res: Response,
  recurso: string,
  detalhes?: string
): Response => {
  return respostaErro(
    res,
    detalhes || `${recurso} já existe na base de dados`,
    `Conflito detectado: ${recurso} duplicado`,
    StatusCodes.CONFLICT
  );
};

/**
 * @param res
 * @param dados
 * @param mensagem
 * @returns
 */
export const respostaCriado = <T>(
  res: Response,
  dados: T,
  mensagem: string = "Recurso criado com sucesso"
): Response => {
  return respostaSucesso(res, dados, StatusCodes.CREATED, mensagem);
};

/**
 * @param res
 * @returns
 */
export const respostaSemConteudo = (res: Response): Response => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * @param res
 * @param mensagem
 * @returns
 */
export const respostaMuitasTentativas = (
  res: Response,
  mensagem: string = "Limite de tentativas excedido"
): Response => {
  return respostaErro(
    res,
    ReasonPhrases.TOO_MANY_REQUESTS,
    mensagem,
    StatusCodes.TOO_MANY_REQUESTS
  );
};

/**
 * @param res
 * @param errosValidacao
 * @param mensagem
 * @returns
 */
export const respostaValidacao = (
  res: Response,
  errosValidacao: string[],
  mensagem: string = "Falha na validação dos dados fornecidos"
): Response => {
  const resposta: RespostaApi = {
    sucesso: false,
    mensagem,
    erro: "Dados não passaram na validação",
    detalhes: errosValidacao,
  };

  return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(resposta);
};
