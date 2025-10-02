/**
 * Utilitários para padronização de respostas HTTP da API
 *
 * Utiliza http-status-codes para códigos e mensagens padronizadas
 * seguindo as especificações RFC 7231 e boas práticas de APIs REST
 */

import { Response } from "express";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { RespostaApi } from "../tipos";

/**
 * Resposta de sucesso padronizada
 *
 * @param res - Objeto Response do Express
 * @param dados - Dados a serem retornados ao cliente
 * @param statusCode - Código de status HTTP (padrão: 200 OK)
 * @param mensagem - Mensagem personalizada (opcional)
 * @returns Response com dados de sucesso
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
 * Resposta de erro padronizada
 *
 * @param res - Objeto Response do Express
 * @param erro - Detalhes técnicos do erro
 * @param mensagem - Mensagem amigável para o usuário
 * @param statusCode - Código de status HTTP
 * @returns Response com dados de erro
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
 * Resposta para recurso não encontrado (404)
 *
 * @param res - Objeto Response do Express
 * @param recurso - Nome do recurso não encontrado
 * @returns Response com erro 404
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
 * Resposta para acesso não autorizado (401)
 *
 * @param res - Objeto Response do Express
 * @param mensagem - Mensagem específica de não autorização
 * @returns Response com erro 401
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
 * Resposta para acesso proibido (403)
 *
 * @param res - Objeto Response do Express
 * @param mensagem - Mensagem específica de proibição
 * @returns Response com erro 403
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
 * Resposta para dados inválidos (400)
 *
 * @param res - Objeto Response do Express
 * @param detalhes - Detalhes da validação (string ou array)
 * @param mensagem - Mensagem personalizada
 * @returns Response com erro 400
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
 * Resposta para conflito de dados (409)
 *
 * @param res - Objeto Response do Express
 * @param recurso - Nome do recurso em conflito
 * @param detalhes - Detalhes específicos do conflito
 * @returns Response com erro 409
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
 * Resposta para recurso criado com sucesso (201)
 *
 * @param res - Objeto Response do Express
 * @param dados - Dados do recurso criado
 * @param mensagem - Mensagem de confirmação
 * @returns Response com status 201
 */
export const respostaCriado = <T>(
  res: Response,
  dados: T,
  mensagem: string = "Recurso criado com sucesso"
): Response => {
  return respostaSucesso(res, dados, StatusCodes.CREATED, mensagem);
};

/**
 * Resposta para operação sem conteúdo (204)
 *
 * @param res - Objeto Response do Express
 * @returns Response vazio com status 204
 */
export const respostaSemConteudo = (res: Response): Response => {
  return res.status(StatusCodes.NO_CONTENT).send();
};

/**
 * Resposta para muitas tentativas (429)
 *
 * @param res - Objeto Response do Express
 * @param mensagem - Mensagem sobre limite de tentativas
 * @returns Response com erro 429
 */
export const respostaMuitasTentativas = (
  res: Response,
  mensagem: string = "Limite de tentativas excedido. Tente novamente em alguns minutos"
): Response => {
  return respostaErro(
    res,
    ReasonPhrases.TOO_MANY_REQUESTS,
    mensagem,
    StatusCodes.TOO_MANY_REQUESTS
  );
};

/**
 * Resposta para erro de validação semântica (422)
 *
 * @param res - Objeto Response do Express
 * @param errosValidacao - Array com erros de validação
 * @param mensagem - Mensagem principal de validação
 * @returns Response com erro 422
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
