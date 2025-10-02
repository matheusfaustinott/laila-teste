import { Request } from "express";
import { Usuario } from "../modelos/usuario";

export interface CriarUsuarioDto {
  nomeCompleto: string;
  email: string;
  senha: string;
}

export interface LoginDto {
  email: string;
  senha: string;
}

export interface TokenPayload {
  usuarioId: string;
  email: string;
  iat?: number;
}

export interface CriarTransacaoDto {
  titulo: string;
  descricao?: string;
  valor: number;
  tipo: "receita" | "despesa" | "RECEITA" | "DESPESA";
  data: string; // passar formato YYYY-MM-DD
  categoriaId?: string;
}

export interface AtualizarTransacaoDto {
  titulo?: string;
  descricao?: string;
  valor?: number;
  tipo?: "receita" | "despesa" | "RECEITA" | "DESPESA";
  data?: string;
  categoriaId?: string;
}

export interface CriarCategoriaDto {
  nome: string;
  descricao?: string;
}

export interface AtualizarCategoriaDto {
  nome?: string;
  descricao?: string;
}

export interface ResumoMensalDto {
  periodo: {
    mes: number;
    ano: number;
  };
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  quantidadeTransacoes: number;
  receitasPorCategoria: { [key: string]: number };
  despesasPorCategoria: { [key: string]: number };
  transacoesMaiores: Array<{
    id: string;
    titulo: string;
    valor: number;
    tipo: "receita" | "despesa";
    data: Date;
    categoria: string | null;
  }>;
}
export interface RequestAutenticado extends Request {
  usuario?: Omit<Usuario, "senha">;
  tokenPayload?: TokenPayload;
}

export interface RespostaApi<T = any> {
  sucesso: boolean;
  mensagem: string;
  dados?: T;
  erro?: string;
  detalhes?: string[];
}
