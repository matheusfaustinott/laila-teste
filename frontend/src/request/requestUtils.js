import axios from "axios";
import { buildUrl, getHeaders } from "./headers";

/**
 * @param {string} endpoint
 * @param {Object} params
 * @param {Function} callbackSucesso
 * @param {Function} callbackErro
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
 * @param {string} endpoint
 * @param {Object} data
 * @param {Function} callbackSucesso
 * @param {Function} callbackErro
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
 * @param {string} endpoint
 * @param {Object} data
 * @param {Function} callbackSucesso
 * @param {Function} callbackErro
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
 * @param {string} endpoint
 * @param {Function} callbackSucesso
 * @param {Function} callbackErro
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
