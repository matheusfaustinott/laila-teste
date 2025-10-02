import { computed, signal } from "@preact/signals-react";

// Estado das categorias
export const categorias = signal([]);
export const categoriaAtual = signal(null);
export const carregandoCategorias = signal(false);
export const erroCategorias = signal(null);

// Estado dos modais/formulários
export const mostrandoFormularioCategoria = signal(false);
export const modoEdicaoCategoria = signal(false); // false = criar, true = editar

// Computed: categorias ordenadas por nome
export const categoriasOrdenadas = computed(() => {
  return [...categorias.value].sort((a, b) => a.nome.localeCompare(b.nome));
});

// Computed: opções para select (incluindo opção vazia)
export const opcoesCategoriasSelect = computed(() => {
  return [
    { value: "", label: "Selecione uma categoria" },
    ...categoriasOrdenadas.value.map((categoria) => ({
      value: categoria.id,
      label: categoria.nome,
    })),
  ];
});

// Funções de controle do estado

export const abrirFormularioCategoria = (categoria = null) => {
  if (categoria) {
    categoriaAtual.value = categoria;
    modoEdicaoCategoria.value = true;
  } else {
    categoriaAtual.value = null;
    modoEdicaoCategoria.value = false;
  }
  mostrandoFormularioCategoria.value = true;
};

export const fecharFormularioCategoria = () => {
  mostrandoFormularioCategoria.value = false;
  categoriaAtual.value = null;
  modoEdicaoCategoria.value = false;
  erroCategorias.value = null;
};

export const resetarFormularioCategoria = () => {
  categoriaAtual.value = null;
  modoEdicaoCategoria.value = false;
  erroCategorias.value = null;
};

export const selecionarCategoria = (categoria) => {
  categoriaAtual.value = categoria;
};

export const definirErroCategorias = (erro) => {
  erroCategorias.value = erro;
};

export const limparErroCategorias = () => {
  erroCategorias.value = null;
};
