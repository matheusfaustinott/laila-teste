import { Router } from "express";
import {
  atualizarUsuario,
  buscarEstatisticasUsuario,
  buscarMeuPerfil,
  buscarUsuarioPorId,
  removerUsuario,
} from "../controladores/usuario";
import { verificarAutenticacao } from "../middlewares/autenticacao";

const roteadorUsuario = Router();
roteadorUsuario.use(verificarAutenticacao);
roteadorUsuario.get("/me", buscarMeuPerfil);
roteadorUsuario.get("/me/estatisticas", buscarEstatisticasUsuario);
roteadorUsuario.get("/:id", buscarUsuarioPorId);
roteadorUsuario.put("/:id", atualizarUsuario);
roteadorUsuario.delete("/:id", removerUsuario);

export const rotasUsuario = roteadorUsuario;
