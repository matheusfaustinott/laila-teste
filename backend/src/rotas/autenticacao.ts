import { Router } from "express";
import {
  atualizarSenha,
  buscarPerfil,
  deslogarUsuario,
  logarUsuario,
  registrarUsuario,
} from "../controladores/autenticacao";
import { verificarAutenticacao } from "../middlewares/autenticacao";

const roteadorAutenticacao = Router();
roteadorAutenticacao.post("/registrar", registrarUsuario);
roteadorAutenticacao.post("/login", logarUsuario);
roteadorAutenticacao.get("/perfil", verificarAutenticacao, buscarPerfil);
roteadorAutenticacao.put(
  "/atualizar-senha",
  verificarAutenticacao,
  atualizarSenha
);
roteadorAutenticacao.post("/logout", verificarAutenticacao, deslogarUsuario);

export const rotasAutenticacao = roteadorAutenticacao;
