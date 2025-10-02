import config from "../config/config";

/**
 * @param {Object} additionalHeaders
 * @returns {Object}
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
 * @returns {Object}
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
 * @param {Object} customConfig
 * @returns {Object}
 */
export const getRequestConfig = (customConfig = {}) => {
  return {
    timeout: config.REQUEST_TIMEOUT,
    headers: getHeaders(),
    ...customConfig,
  };
};

/**
 * @param {string} endpoint
 * @returns {string}
 */
export const buildUrl = (endpoint) => {
  return `${config.API_BASE_URL}${endpoint}`;
};

/**
 * @param {Object} params
 * @returns {URLSearchParams}
 */
export const buildQueryParams = (params = {}) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );

  return new URLSearchParams(cleanParams);
};
