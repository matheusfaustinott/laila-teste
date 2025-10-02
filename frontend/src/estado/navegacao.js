import { signal } from "@preact/signals-react";

// Estado da navegação
export const telaAtual = signal("dashboard"); // dashboard, transacoes, categorias, resumo

// Funções de navegação
export const irParaDashboard = () => {
  telaAtual.value = "dashboard";
};

export const irParaTransacoes = () => {
  telaAtual.value = "transacoes";
};

export const irParaCategorias = () => {
  telaAtual.value = "categorias";
};

export const irParaResumo = () => {
  telaAtual.value = "resumo";
};
