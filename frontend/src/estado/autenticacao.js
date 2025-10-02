import { computed, signal } from "@preact/signals-react";

export const usuarioLogado = signal(null);
export const carregando = signal(false);
export const erro = signal(null);
export const tokenAuth = signal(localStorage.getItem("token") || null);
export const mostrandoLogin = signal(true);
export const estaLogado = computed(() => {
  return usuarioLogado.value !== null && tokenAuth.value !== null;
});
export const carregandoAutenticacao = computed(() => {
  return carregando.value;
});
export const fazerLogin = (dadosUsuario, token) => {
  usuarioLogado.value = dadosUsuario;
  tokenAuth.value = token;
  localStorage.setItem("token", token);
  localStorage.setItem("usuario", JSON.stringify(dadosUsuario));
};
export const fazerLogout = () => {
  usuarioLogado.value = null;
  tokenAuth.value = null;
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};
export const alternarModo = () => {
  mostrandoLogin.value = !mostrandoLogin.value;
  erro.value = null;
};
export const definirErro = (mensagem) => {
  erro.value = mensagem;
};
export const limparErro = () => {
  erro.value = null;
};
export const definirCarregando = (estado) => {
  carregando.value = estado;
};
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
export const verificarTokenExistente = () => {
  definirCarregando(true);

  const token = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuario");

  if (token && usuarioSalvo) {
    try {
      const dadosUsuario = JSON.parse(usuarioSalvo);
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
