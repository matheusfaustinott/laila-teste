import { signal } from "@preact/signals-react";
import strings from "../strings";

// Estado para modal de erro
export const modalErro = signal({
  aberto: false,
  titulo: "",
  mensagem: "",
  tipo: "error", // error, warning, info, success
  aoFechar: null,
});

// Estado para modal de confirmação
export const modalConfirmacao = signal({
  aberto: false,
  titulo: "",
  mensagem: "",
  aoConfirmar: null,
  aoCancel: null,
  textoConfirmar: "Confirmar",
  textoCancelar: "Cancelar",
  tipoConfirmar: "primary", // primary, secondary, error, warning
});

// Estado para modal de carregamento
export const modalCarregamento = signal({
  aberto: false,
  mensagem: strings.geral.carregando,
});

// Estado para modal de erro de credenciais (login específico)
export const modalErroCredenciais = signal({
  aberto: false,
  aoIrParaCadastro: null,
  aoFechar: null,
});

/**
 * Função para mostrar modal de erro
 * @param {string} titulo - Título do modal
 * @param {string} mensagem - Mensagem de erro
 * @param {string} tipo - Tipo do erro (error, warning, info, success)
 * @param {Function} aoFechar - Callback ao fechar
 */
export const mostrarModalErro = (
  titulo,
  mensagem,
  tipo = "error",
  aoFechar = null
) => {
  modalErro.value = {
    aberto: true,
    titulo,
    mensagem,
    tipo,
    aoFechar,
  };
};

export const fecharModalErro = () => {
  if (modalErro.value.aoFechar) {
    modalErro.value.aoFechar();
  }

  modalErro.value = {
    ...modalErro.value,
    aberto: false,
  };
};

/**
 * @param {string} titulo
 * @param {string} mensagem
 * @param {Function} aoConfirmar
 * @param {Function} aoCancel
 * @param {Object} opcoes
 */
export const mostrarModalConfirmacao = (
  titulo,
  mensagem,
  aoConfirmar,
  aoCancel = null,
  opcoes = {}
) => {
  modalConfirmacao.value = {
    aberto: true,
    titulo,
    mensagem,
    aoConfirmar,
    aoCancel,
    textoConfirmar: opcoes.textoConfirmar,
    textoCancelar: opcoes.textoCancelar,
    tipoConfirmar: opcoes.tipoConfirmar,
  };
};

export const fecharModalConfirmacao = () => {
  modalConfirmacao.value = {
    ...modalConfirmacao.value,
    aberto: false,
  };
};

export const confirmarAcao = () => {
  if (modalConfirmacao.value.aoConfirmar) {
    modalConfirmacao.value.aoConfirmar();
  }
  fecharModalConfirmacao();
};

export const cancelarAcao = () => {
  if (modalConfirmacao.value.aoCancel) {
    modalConfirmacao.value.aoCancel();
  }
  fecharModalConfirmacao();
};

/**
 * @param {string} mensagem
 */
export const mostrarModalCarregamento = (
  mensagem = strings.geral.carregando
) => {
  modalCarregamento.value = {
    aberto: true,
    mensagem,
  };
};

/**
 * Função para fechar modal de carregamento
 */
export const fecharModalCarregamento = () => {
  modalCarregamento.value = {
    aberto: false,
    mensagem: strings.geral.carregando,
  };
};

/**
 * Função para mostrar modal de erro de credenciais
 * @param {Function} aoIrParaCadastro - Callback para ir para cadastro
 * @param {Function} aoFechar - Callback ao fechar
 */
export const mostrarModalErroCredenciais = (
  aoIrParaCadastro = null,
  aoFechar = null
) => {
  modalErroCredenciais.value = {
    aberto: true,
    aoIrParaCadastro,
    aoFechar,
  };
};

/**
 * Função para fechar modal de erro de credenciais
 */
export const fecharModalErroCredenciais = () => {
  if (modalErroCredenciais.value.aoFechar) {
    modalErroCredenciais.value.aoFechar();
  }

  modalErroCredenciais.value = {
    ...modalErroCredenciais.value,
    aberto: false,
  };
};

/**
 * Função para ir para cadastro a partir do modal de erro de credenciais
 */
export const irParaCadastroDoModal = () => {
  if (modalErroCredenciais.value.aoIrParaCadastro) {
    modalErroCredenciais.value.aoIrParaCadastro();
  }
  fecharModalErroCredenciais();
};
