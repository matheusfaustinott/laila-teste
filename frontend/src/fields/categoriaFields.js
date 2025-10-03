import { stringsCategorias } from "../strings/categoriaStrings";

export const categoryFields = {
  nome: {
    name: "nome",
    label: stringsCategorias.nome,
    type: "text",
    required: true,
    validation: {
      required: stringsCategorias.nomeObrigatorio,
      minLength: {
        value: 2,
        message: stringsCategorias.nomeMinimo,
      },
    },
    placeholder: stringsCategorias.placeholderNome,
  },

  cor: {
    name: "cor",
    label: stringsCategorias.cor,
    type: "color",
    required: true,
    validation: {
      required: stringsCategorias.corObrigatoria,
    },
    defaultValue: "#1a237e",
  },

  descricao: {
    name: "descricao",
    label: stringsCategorias.descricao,
    type: "textarea",
    required: false,
    validation: {},
    placeholder: stringsCategorias.placeholderDescricao,
    multiline: true,
    rows: 2,
  },
};
