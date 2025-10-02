import { Router } from "express";
import {
  atualizarCategoria,
  buscarCategoriaPorId,
  criarCategoria,
  listarCategorias,
  listarCategoriasMaisUsadas,
  removerCategoria,
} from "../controladores/categoria";
import { verificarAutenticacao } from "../middlewares/autenticacao";
const roteadorCategoria = Router();
roteadorCategoria.use(verificarAutenticacao);
roteadorCategoria.get("/", listarCategorias);
roteadorCategoria.get("/mais-usadas", listarCategoriasMaisUsadas);
roteadorCategoria.get("/:id", buscarCategoriaPorId);
roteadorCategoria.post("/", criarCategoria);
roteadorCategoria.put("/:id", atualizarCategoria);
roteadorCategoria.delete("/:id", removerCategoria);

export const rotasCategorias = roteadorCategoria;
