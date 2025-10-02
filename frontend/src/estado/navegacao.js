import { signal } from "@preact/signals-react";

// default

export const telaAtual = signal("dashboard");

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
