import { signal } from "@preact/signals-react";
import strings from "../strings";

export const modalErro = signal({
  aberto: false,
  titulo: "",
  mensagem: "",
  tipo: "error",
  aoFechar: null,
});
export const modalConfirmacao = signal({
  aberto: false,
  titulo: "",
  mensagem: "",
  aoConfirmar: null,
  aoCancel: null,
  textoConfirmar: "Confirmar",
  textoCancelar: "Cancelar",
  tipoConfirmar: "primary",
});
export const modalCarregamento = signal({
  aberto: false,
  mensagem: strings.geral.carregando,
});

export const modalErroCredenciais = signal({
  aberto: false,
  aoIrParaCadastro: null,
  aoFechar: null,
});

/**
 *
 * @param {string} titulo
 * @param {string} mensagem
 * @param {string} tipo
 * @param {Function} aoFechar
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

export const fecharModalCarregamento = () => {
  modalCarregamento.value = {
    aberto: false,
    mensagem: strings.geral.carregando,
  };
};

/**
 * @param {Function} aoIrParaCadastro
 * @param {Function} aoFechar
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

export const fecharModalErroCredenciais = () => {
  if (modalErroCredenciais.value.aoFechar) {
    modalErroCredenciais.value.aoFechar();
  }

  modalErroCredenciais.value = {
    ...modalErroCredenciais.value,
    aberto: false,
  };
};

export const irParaCadastroDoModal = () => {
  if (modalErroCredenciais.value.aoIrParaCadastro) {
    modalErroCredenciais.value.aoIrParaCadastro();
  }
  fecharModalErroCredenciais();
};
