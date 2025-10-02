import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Usuario } from "../modelos/usuario";
import { CriarUsuarioDto, LoginDto, TokenPayload } from "../tipos";

class ServicoAutenticacao {
  private repositorioUsuario: Repository<Usuario>;
  private chaveSecretaJWT: string;
  private expiracaoToken: string;
  private saltRounds: number;

  constructor() {
    // Inicia TypeORM
    this.repositorioUsuario = AppDataSource.getRepository(Usuario);
    this.chaveSecretaJWT =
      process.env.JWT_SECRET ||
      "8f3e9d2a7b5c1e4f6a9b8c0d3e2f1a4b7c6d9e8f0a1b2c5d4e3f6a7b8c9d0e1f2";
    this.expiracaoToken = process.env.JWT_EXPIRATION || "24h";
    this.saltRounds = 12;
  }

  /**
   *
   * @param dadosUsuario
   * @returns
   */
  async registrarUsuario(
    dadosUsuario: CriarUsuarioDto
  ): Promise<Omit<Usuario, "senha">> {
    const { nomeCompleto, email, senha } = dadosUsuario;
    const usuarioExistente = await this.repositorioUsuario.findOne({
      where: { email },
    });
    if (usuarioExistente) {
      throw new Error("Email já está em uso");
    }
    const senhaHasheada = await bcrypt.hash(senha, this.saltRounds);
    const novoUsuario = this.repositorioUsuario.create({
      nomeCompleto,
      email,
      senha: senhaHasheada,
    });
    const usuarioSalvo = await this.repositorioUsuario.save(novoUsuario);
    const { senha: _, ...usuarioSemSenha } = usuarioSalvo;
    return usuarioSemSenha;
  }

  /**
   * @param dadosLogin
   * @returns
   */
  async autenticarUsuario(
    dadosLogin: LoginDto
  ): Promise<{ token: string; usuario: Omit<Usuario, "senha"> }> {
    const { email, senha } = dadosLogin;
    const usuario = await this.repositorioUsuario.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error("Credenciais inválidas");
    }
    const token = this.gerarTokenJWT(usuario);
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  /**
   * @param usuario
   * @returns
   */
  private gerarTokenJWT(usuario: Usuario): string {
    const payload = {
      usuarioId: usuario.id,
      email: usuario.email,
      iat: Math.floor(Date.now() / 1000),
    };
    return jwt.sign(
      payload,
      this.chaveSecretaJWT as jwt.Secret,
      {
        expiresIn: this.expiracaoToken,
      } as jwt.SignOptions
    );
  }

  /**
   *
   * @param token
   * @returns
   */
  async verificarToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, this.chaveSecretaJWT) as TokenPayload;
      const usuario = await this.repositorioUsuario.findOne({
        where: { id: decoded.usuarioId },
      });

      if (!usuario) {
        throw new Error("Usuário não encontrado");
      }

      return decoded;
    } catch (error) {
      throw new Error("Token inválido");
    }
  }

  /**
   * @param usuarioId
   * @returns
   */
  async buscarUsuarioPorId(
    usuarioId: string
  ): Promise<Omit<Usuario, "senha"> | null> {
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      return null;
    }
    const { senha: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  /**
   * @param usuarioId
   * @param senhaAtual
   * @param novaSenha
   */
  async atualizarSenha(
    usuarioId: string,
    senhaAtual: string,
    novaSenha: string
  ): Promise<void> {
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }
    const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaAtualValida) {
      throw new Error("Senha atual incorreta");
    }
    // Gera hash
    const novaSenhaHasheada = await bcrypt.hash(novaSenha, this.saltRounds);
    await this.repositorioUsuario.update(usuarioId, {
      senha: novaSenhaHasheada,
    });
  }
}

export const servicoAutenticacao = new ServicoAutenticacao();
