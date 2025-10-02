export const config = {
  // URLs da API
  API_BASE_URL: "http://localhost:3001/api",
  // URLs específicas
  API_ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/registrar",
      PROFILE: "/auth/perfil",
      LOGOUT: "/auth/logout",
      UPDATE_PASSWORD: "/auth/atualizar-senha",
    },
    TRANSACTIONS: {
      LIST: "/transacoes",
      CREATE: "/transacoes",
      UPDATE: "/transacoes",
      DELETE: "/transacoes",
      RESUMO_MENSAL: "/transacoes/resumo/mensal",
    },
    CATEGORIES: {
      LIST: "/categorias",
      CREATE: "/categorias",
      UPDATE: "/categorias",
      DELETE: "/categorias",
    },
  },
  REQUEST_TIMEOUT: 10000,

  //paginação
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },

  //validação
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 100,
    MIN_NAME_LENGTH: 2,
    MAX_NAME_LENGTH: 100,
  },

  //tema
  THEME: {
    PRIMARY_COLOR: "rgba(76, 3, 107, 1)",
    SECONDARY_COLOR: "rgba(151, 65, 189, 1)",
    ERROR_COLOR: "#f44336",
    SUCCESS_COLOR: "#4caf50",
    WARNING_COLOR: "#ff9800",
  },

  //storage
  STORAGE_KEYS: {
    TOKEN: "token",
    USER: "usuario",
    THEME: "tema",
  },
};

export default config;
