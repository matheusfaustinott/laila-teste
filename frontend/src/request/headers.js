import config from "../config/config";

/**
 * Função para obter headers padrão das requisições
 * @param {Object} additionalHeaders - Headers adicionais
 * @returns {Object} Headers configurados
 */
export const getHeaders = (additionalHeaders = {}) => {
  const token = localStorage.getItem(config.STORAGE_KEYS.TOKEN);

  const headers = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Função para obter headers para upload de arquivos
 * @returns {Object} Headers para multipart/form-data
 */
export const getFileHeaders = () => {
  const token = localStorage.getItem(config.STORAGE_KEYS.TOKEN);

  const headers = {};

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Função para obter configuração padrão do axios
 * @param {Object} customConfig - Configurações personalizadas
 * @returns {Object} Configuração do axios
 */
export const getRequestConfig = (customConfig = {}) => {
  return {
    timeout: config.REQUEST_TIMEOUT,
    headers: getHeaders(),
    ...customConfig,
  };
};

/**
 * Função para construir URL completa
 * @param {string} endpoint - Endpoint da API
 * @returns {string} URL completa
 */
export const buildUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

/**
 * Função para construir parâmetros de query string
 * @param {Object} params - Parâmetros
 * @returns {URLSearchParams} Query string
 */
export const buildQueryParams = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );

  return new URLSearchParams(cleanParams);
};
