import { stringsTransacoes } from "../strings/transactionStrings";

export const transactionFields = {
  titulo: {
    name: "titulo",
    label: stringsTransacoes.titulo,
    type: "text",
    required: true,
    validation: {
      required: stringsTransacoes.tituloObrigatorio,
      minLength: {
        value: 3,
        message: stringsTransacoes.tituloMinimo,
      },
    },
    placeholder: stringsTransacoes.placeholderTitulo,
  },

  valor: {
    name: "valor",
    label: stringsTransacoes.valor,
    type: "number",
    required: true,
    validation: {
      required: stringsTransacoes.valorObrigatorio,
      min: {
        value: 0.01,
        message: stringsTransacoes.valorMinimoMaiorQueZero,
      },
    },
    placeholder: stringsTransacoes.placeholderValor,
    step: "0.01",
  },

  tipo: {
    name: "tipo",
    label: stringsTransacoes.tipo,
    type: "select",
    required: true,
    validation: {
      required: stringsTransacoes.tipoObrigatorio,
    },
    options: [
      { value: "receita", label: stringsTransacoes.receita },
      { value: "despesa", label: stringsTransacoes.despesa },
    ],
  },

  categoria: {
    name: "categoria",
    label: stringsTransacoes.categoria,
    type: "select",
    required: false,
    validation: {},
    placeholder: stringsTransacoes.placeholderCategoria,
  },

  data: {
    name: "data",
    label: stringsTransacoes.data,
    type: "date",
    required: true,
    validation: {
      required: stringsTransacoes.dataObrigatoria,
    },
  },

  observacoes: {
    name: "observacoes",
    label: stringsTransacoes.observacoes,
    type: "textarea",
    required: false,
    validation: {},
    placeholder: stringsTransacoes.placeholderObservacoes,
    multiline: true,
    rows: 3,
  },
};
