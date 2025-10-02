// Arquivo central para exportar todas as strings
import { stringsAutenticacao } from "./authStrings";
import { stringsCategorias } from "./categoryStrings";
import { stringsGerais } from "./generalStrings";
import { stringsTransacoes } from "./transactionStrings";

export { stringsAutenticacao } from "./authStrings";
export { stringsCategorias } from "./categoryStrings";
export { stringsGerais } from "./generalStrings";
export { stringsTransacoes } from "./transactionStrings";

// Objeto central com todas as strings - facilita o acesso como strings.autenticacao.tituloLogin
export const strings = {
  autenticacao: stringsAutenticacao,
  geral: stringsGerais,
  transacoes: stringsTransacoes,
  categorias: stringsCategorias,
};

export default strings;
