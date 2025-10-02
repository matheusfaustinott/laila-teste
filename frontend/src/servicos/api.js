import axios from "axios";
import config from "../config/config";
import {
  fecharModalCarregamento,
  mostrarModalCarregamento,
  mostrarModalErro,
} from "../estado/modais";
import { getHeaders, getRequestConfig } from "../request/headers";
import strings from "../strings";

/**
 * @param {Object} error
 * @param {Function} callbackErro
 */
const tratarErro = (error, callbackErro = null) => {
  console.error("Erro completo:", error);
  let mensagem = strings.geral.erroGeral;
  let titulo = strings.geral.erro;

  if (error.response) {
    console.log("Erro de resposta da API:", error.response);
    mensagem = error.response.data?.mensagem || strings.geral.erroGeral;

    if (error.response.status === 401) {
      if (
        mensagem.toLowerCase().includes("expirada") ||
        mensagem.toLowerCase().includes("expired")
      ) {
        mensagem = strings.autenticacao.sessaoExpirada;
        localStorage.removeItem(config.STORAGE_KEYS.TOKEN);
        localStorage.removeItem(config.STORAGE_KEYS.USER);
        window.location.href = "/";
        return;
      }
    }

    switch (error.response.status) {
      case 400:
        titulo = "Dados Inválidos";
        break;
      case 403:
        titulo = "Acesso Negado";
        break;
      case 404:
        titulo = "Não Encontrado";
        break;
      case 500:
        titulo = "Erro do Servidor";
        break;
      default:
        titulo = strings.geral.erro;
    }
  } else if (error.request) {
    console.log("Erro de rede:", error.request);
    mensagem = strings.autenticacao.erroConexao;
    titulo = "Erro de Conexão";
  } else {
    console.log("Erro na configuração da requisição:", error.message);
    mensagem = "Erro ao configurar requisição: " + error.message;
    titulo = "Erro de Configuração";
  }

  if (callbackErro) {
    callbackErro(mensagem);
  } else {
    mostrarModalErro(titulo, mensagem, "error");
  }
};

// Serviços de autenticação
export const autenticacaoAPI = {
  // Fazer login
  login: (email, senha, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(strings.autenticacao.carregandoLogin);

    axios
      .post(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.LOGIN}`,
        {
          email,
          senha,
        },
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        console.error("Erro na requisição de login:", error);
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Fazer cadastro
  cadastro: (
    nomeCompleto,
    email,
    senha,
    callbackSucesso = null,
    callbackErro = null
  ) => {
    mostrarModalCarregamento(strings.autenticacao.carregandoCadastro);

    axios
      .post(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.REGISTER}`,
        {
          nomeCompleto,
          email,
          senha,
        },
        {
          headers: getHeaders(),
        }
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Buscar perfil do usuário
  buscarPerfil: (callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento("Carregando perfil...");

    axios
      .get(`${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.PROFILE}`, {
        headers: getHeaders(),
      })
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Fazer logout
  logout: (callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(strings.autenticacao.carregandoLogout);

    axios
      .post(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.AUTH.LOGOUT}`,
        {},
        {
          headers: getHeaders(),
        }
      )
      .then((response) => {
        if (callbackSucesso) {
          callbackSucesso(response.data);
        }
      })
      .catch((error) => {
        console.warn("Erro ao fazer logout no servidor:", error);
        // Não mostra erro para o usuário, pois logout deve sempre funcionar
        if (callbackSucesso) {
          callbackSucesso();
        }
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },
};

// Serviços de transações
export const transacoesAPI = {
  // Listar transações
  listar: (params = {}, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(strings.transacoes.carregandoTransacoes);

    axios
      .get(`${config.API_BASE_URL}${config.API_ENDPOINTS.TRANSACTIONS.LIST}`, {
        params: params,
        headers: getHeaders(),
      })
      .then((response) => {
        const dados = response.data.dados;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        if (callbackErro) {
          callbackErro({
            transacoes: [],
            paginacao: { totalItens: 0 },
          });
        }
        tratarErro(error);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Criar transação
  criar: (dadosTransacao, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(strings.transacoes.salvandoTransacao);

    axios
      .post(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.TRANSACTIONS.CREATE}`,
        dadosTransacao,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Atualizar transação
  atualizar: (
    id,
    dadosTransacao,
    callbackSucesso = null,
    callbackErro = null
  ) => {
    mostrarModalCarregamento(strings.transacoes.salvandoTransacao);

    axios
      .put(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.TRANSACTIONS.UPDATE}/${id}`,
        dadosTransacao,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Excluir transação
  excluir: (id, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(strings.transacoes.excluindoTransacao);

    axios
      .delete(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.TRANSACTIONS.DELETE}/${id}`,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Obter resumo mensal
  resumoMensal: (ano, mes, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento("Carregando resumo mensal...");

    axios
      .get(`${config.API_BASE_URL}/transacoes/resumo/mensal`, {
        params: { ano, mes },
        ...getRequestConfig(),
      })
      .then((response) => {
        const dados = response.data.dados;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },
};

// Serviços de categorias
export const categoriasAPI = {
  // Listar categorias
  listar: (params = {}, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(
      strings.categorias.carregandoCategorias || "Carregando categorias..."
    );

    axios
      .get(`${config.API_BASE_URL}${config.API_ENDPOINTS.CATEGORIES.LIST}`, {
        params: params,
        ...getRequestConfig(),
      })
      .then((response) => {
        const dados = response.data.dados;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        if (callbackErro) {
          callbackErro({
            categorias: [],
            paginacao: { totalItens: 0 },
          });
        }
        tratarErro(error);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Criar categoria
  criar: (dadosCategoria, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(
      strings.categorias.salvandoCategoria || "Salvando categoria..."
    );

    axios
      .post(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.CATEGORIES.CREATE}`,
        dadosCategoria,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Atualizar categoria
  atualizar: (
    id,
    dadosCategoria,
    callbackSucesso = null,
    callbackErro = null
  ) => {
    mostrarModalCarregamento(
      strings.categorias.salvandoCategoria || "Salvando categoria..."
    );

    axios
      .put(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.CATEGORIES.UPDATE}/${id}`,
        dadosCategoria,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },

  // Excluir categoria
  excluir: (id, callbackSucesso = null, callbackErro = null) => {
    mostrarModalCarregamento(
      strings.categorias.excluindoCategoria || "Excluindo categoria..."
    );

    axios
      .delete(
        `${config.API_BASE_URL}${config.API_ENDPOINTS.CATEGORIES.DELETE}/${id}`,
        getRequestConfig()
      )
      .then((response) => {
        const dados = response.data;
        if (callbackSucesso) {
          callbackSucesso(dados);
        }
      })
      .catch((error) => {
        tratarErro(error, callbackErro);
      })
      .finally(() => {
        fecharModalCarregamento();
      });
  },
};
