import { computed, signal } from "@preact/signals-react";

// Estado das transações
export const transacoes = signal([]);
export const transacaoAtual = signal(null);
export const carregandoTransacoes = signal(false);
export const erroTransacoes = signal(null);

// Estado dos filtros
export const filtrosTipo = signal("TODOS"); // TODOS, RECEITA, DESPESA
export const filtrosCategoria = signal(null);
export const filtrosDataInicio = signal(null);
export const filtrosDataFim = signal(null);
export const termoBusca = signal("");

// Estado da paginação
export const paginaAtual = signal(1);
export const totalPaginas = signal(1);
export const totalItens = signal(0);
export const itensPorPagina = signal(10);

// Estado dos modais/formulários
export const mostrandoFormularioTransacao = signal(false);
export const modoEdicao = signal(false); // false = criar, true = editar

// Computed: transações filtradas
export const transacoesFiltradas = computed(() => {
  let resultado = transacoes.value;

  // Filtro por tipo
  if (filtrosTipo.value !== "TODOS") {
    resultado = resultado.filter(
      (transacao) => transacao.tipo?.toUpperCase() === filtrosTipo.value
    );
  }

  // Filtro por categoria
  if (filtrosCategoria.value) {
    resultado = resultado.filter(
      (transacao) => transacao.categoria?.id === filtrosCategoria.value
    );
  }

  // Filtro por busca no título
  if (termoBusca.value) {
    resultado = resultado.filter(
      (transacao) =>
        transacao.titulo
          .toLowerCase()
          .includes(termoBusca.value.toLowerCase()) ||
        (transacao.descricao &&
          transacao.descricao
            .toLowerCase()
            .includes(termoBusca.value.toLowerCase()))
    );
  }

  return resultado;
});

// Computed: estatísticas das transações atuais
export const estatisticasTransacoes = computed(() => {
  const transacoesList = transacoesFiltradas.value;

  const totalReceitas = transacoesList
    .filter((t) => t.tipo?.toUpperCase() === "RECEITA")
    .reduce((total, t) => total + t.valor, 0);

  const totalDespesas = transacoesList
    .filter((t) => t.tipo?.toUpperCase() === "DESPESA")
    .reduce((total, t) => total + t.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  return {
    totalReceitas,
    totalDespesas,
    saldo,
    quantidadeTotal: transacoesList.length,
    quantidadeReceitas: transacoesList.filter(
      (t) => t.tipo?.toUpperCase() === "RECEITA"
    ).length,
    quantidadeDespesas: transacoesList.filter(
      (t) => t.tipo?.toUpperCase() === "DESPESA"
    ).length,
  };
});

// Funções de controle do estado

export const limparFiltros = () => {
  filtrosTipo.value = "TODOS";
  filtrosCategoria.value = null;
  filtrosDataInicio.value = null;
  filtrosDataFim.value = null;
  termoBusca.value = "";
};

export const abrirFormularioTransacao = (transacao = null) => {
  if (transacao) {
    transacaoAtual.value = transacao;
    modoEdicao.value = true;
  } else {
    transacaoAtual.value = null;
    modoEdicao.value = false;
  }
  mostrandoFormularioTransacao.value = true;
};

export const fecharFormularioTransacao = () => {
  mostrandoFormularioTransacao.value = false;
  transacaoAtual.value = null;
  modoEdicao.value = false;
  erroTransacoes.value = null;
};

export const definirErroTransacoes = (erro) => {
  erroTransacoes.value = erro;
};

export const limparErroTransacoes = () => {
  erroTransacoes.value = null;
};
