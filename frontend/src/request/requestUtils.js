import axios from "axios";
import { buildUrl, getHeaders } from "./headers";

/**
 * Função para fazer requisições GET
 * @param {string} endpoint - Endpoint da API
 * @param {Object} params - Parâmetros da query
 * @param {Function} callbackSucesso - Callback de sucesso
 * @param {Function} callbackErro - Callback de erro
 */
export const fazerReqGet = (
  endpoint,
  params = {},
  callbackSucesso = null,
  callbackErro = null
) => {
  axios
    .get(buildUrl(endpoint), {
      params: params,
      headers: getHeaders(),
    })
    .then((response) => {
      if (callbackSucesso) {
        callbackSucesso(response.data);
      }
    })
    .catch((error) => {
      if (callbackErro) {
        callbackErro(error);
      }
    });
};

/**
 * Função para fazer requisições POST
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados do body
 * @param {Function} callbackSucesso - Callback de sucesso
 * @param {Function} callbackErro - Callback de erro
 */
export const fazerReqPost = (
  endpoint,
  data = {},
  callbackSucesso = null,
  callbackErro = null
) => {
  axios
    .post(buildUrl(endpoint), data, {
      headers: getHeaders(),
    })
    .then((response) => {
      if (callbackSucesso) {
        callbackSucesso(response.data);
      }
    })
    .catch((error) => {
      if (callbackErro) {
        callbackErro(error);
      }
    });
};

/**
 * Função para fazer requisições PUT
 * @param {string} endpoint - Endpoint da API
 * @param {Object} data - Dados do body
 * @param {Function} callbackSucesso - Callback de sucesso
 * @param {Function} callbackErro - Callback de erro
 */
export const fazerReqPut = (
  endpoint,
  data = {},
  callbackSucesso = null,
  callbackErro = null
) => {
  axios
    .put(buildUrl(endpoint), data, {
      headers: getHeaders(),
    })
    .then((response) => {
      if (callbackSucesso) {
        callbackSucesso(response.data);
      }
    })
    .catch((error) => {
      if (callbackErro) {
        callbackErro(error);
      }
    });
};

/**
 * Função para fazer requisições DELETE
 * @param {string} endpoint - Endpoint da API
 * @param {Function} callbackSucesso - Callback de sucesso
 * @param {Function} callbackErro - Callback de erro
 */
export const fazerReqDelete = (
  endpoint,
  callbackSucesso = null,
  callbackErro = null
) => {
  axios
    .delete(buildUrl(endpoint), {
      headers: getHeaders(),
    })
    .then((response) => {
      if (callbackSucesso) {
        callbackSucesso(response.data);
      }
    })
    .catch((error) => {
      if (callbackErro) {
        callbackErro(error);
      }
    });
};
