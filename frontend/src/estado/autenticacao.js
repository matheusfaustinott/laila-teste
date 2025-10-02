import { computed, signal } from "@preact/signals-react";

// Estado do usuário logado
export const usuarioLogado = signal(null);

// Estado de carregamento
export const carregando = signal(false);

// Estado de erros
export const erro = signal(null);

// Token de autenticação
export const tokenAuth = signal(localStorage.getItem("token") || null);

// Estado da interface
export const mostrandoLogin = signal(true); // true = login, false = cadastro

// Computed: verifica se está logado
export const estaLogado = computed(() => {
  return usuarioLogado.value !== null && tokenAuth.value !== null;
});

// Computed: estado de carregamento da autenticação
export const carregandoAutenticacao = computed(() => {
  return carregando.value;
});

// Função para fazer login
export const fazerLogin = (dadosUsuario, token) => {
  usuarioLogado.value = dadosUsuario;
  tokenAuth.value = token;
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
};

// Função para fazer logout
export const fazerLogout = () => {
  usuarioLogado.value = null;
  tokenAuth.value = null;
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

// Função para alternar entre login e cadastro
export const alternarModo = () => {
  mostrandoLogin.value = !mostrandoLogin.value;
  erro.value = null; // Limpa erros ao trocar de modo
};

// Função para definir erro
export const definirErro = (mensagem) => {
  erro.value = mensagem;
};

// Função para limpar erro
export const limparErro = () => {
  erro.value = null;
};

// Função para definir carregamento
export const definirCarregando = (estado) => {
  carregando.value = estado;
};

// Função para restaurar usuário do localStorage
export const restaurarUsuario = () => {
  const usuarioSalvo = localStorage.getItem("usuario");
  if (usuarioSalvo && tokenAuth.value) {
    try {
      usuarioLogado.value = JSON.parse(usuarioSalvo);
    } catch (error) {
      console.error("Erro ao restaurar usuário:", error);
      fazerLogout();
    }
  }
};

// Função para verificar token existente no carregamento da aplicação
export const verificarTokenExistente = () => {
  definirCarregando(true);

  const token = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuario");

  if (token && usuarioSalvo) {
    try {
      const dadosUsuario = JSON.parse(usuarioSalvo);
      // Simulando uma verificação do token
      setTimeout(() => {
        fazerLogin(dadosUsuario, token);
        definirCarregando(false);
      }, 1000);
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      fazerLogout();
      definirCarregando(false);
    }
  } else {
    definirCarregando(false);
  }
};
