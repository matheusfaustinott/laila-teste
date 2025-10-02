import { computed, signal } from "@preact/signals-react";
export const categorias = signal([]);
export const categoriaAtual = signal(null);
export const carregandoCategorias = signal(false);
export const erroCategorias = signal(null);
export const mostrandoFormularioCategoria = signal(false);
export const modoEdicaoCategoria = signal(false);
export const nomeFormulario = signal("");
export const descricaoFormulario = signal("");
export const mostrandoConfirmacaoRemocao = signal(false);
export const categoriaParaRemover = signal(null);
export const categoriasOrdenadas = computed(() => {
  return [...categorias.value].sort((a, b) => a.nome.localeCompare(b.nome));
});
export const opcoesCategoriasSelect = computed(() => {
  return [
    { value: "", label: "Selecione uma categoria" },
    ...categoriasOrdenadas.value.map((categoria) => ({
      value: categoria.id,
      label: categoria.nome,
    })),
  ];
});

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
  nomeFormulario.value = "";
  descricaoFormulario.value = "";
};

export const preencherFormularioCategoria = (categoria) => {
  nomeFormulario.value = categoria?.nome || "";
  descricaoFormulario.value = categoria?.descricao || "";
};

export const abrirConfirmacaoRemocao = (categoria) => {
  categoriaParaRemover.value = categoria;
  mostrandoConfirmacaoRemocao.value = true;
};

export const fecharConfirmacaoRemocao = () => {
  categoriaParaRemover.value = null;
  mostrandoConfirmacaoRemocao.value = false;
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
