// Campos de categorias
import { stringsCategorias } from "../strings/categoryStrings";

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

  icone: {
    name: "icone",
    label: stringsCategorias.icone,
    type: "select",
    required: false,
    validation: {},
    options: [
      { value: "home", label: stringsCategorias.icones.home },
      { value: "alimentacao", label: stringsCategorias.icones.alimentacao },
      { value: "transporte", label: stringsCategorias.icones.transporte },
      { value: "saude", label: stringsCategorias.icones.saude },
      { value: "educacao", label: stringsCategorias.icones.educacao },
      { value: "lazer", label: stringsCategorias.icones.lazer },
      { value: "compras", label: stringsCategorias.icones.compras },
      { value: "trabalho", label: stringsCategorias.icones.trabalho },
      { value: "investimentos", label: stringsCategorias.icones.investimentos },
      { value: "servicos", label: stringsCategorias.icones.servicos },
      { value: "viagem", label: stringsCategorias.icones.viagem },
      { value: "outros", label: stringsCategorias.icones.outros },
    ],
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
