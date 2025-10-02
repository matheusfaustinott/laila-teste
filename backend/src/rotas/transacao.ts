import { Router } from "express";
import {
  atualizarTransacao,
  buscarTransacaoPorId,
  criarTransacao,
  listarTransacoes,
  obterResumoMensal,
  removerTransacao,
} from "../controladores/transacao";
import { verificarAutenticacao } from "../middlewares/autenticacao";

const roteadorTransacao = Router();
roteadorTransacao.use(verificarAutenticacao);
roteadorTransacao.get("/", listarTransacoes);
roteadorTransacao.get("/resumo/mensal", obterResumoMensal);
roteadorTransacao.get("/:id", buscarTransacaoPorId);
roteadorTransacao.post("/", criarTransacao);
roteadorTransacao.put("/:id", atualizarTransacao);
roteadorTransacao.delete("/:id", removerTransacao);

export const rotasTransacoes = roteadorTransacao;
