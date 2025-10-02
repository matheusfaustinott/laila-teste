import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Usuario } from "../modelos/usuario";
import { CriarUsuarioDto, LoginDto, TokenPayload } from "../tipos";

/**
 * Serviço de Autenticação
 *
 * Este serviço é responsável por toda a lógica de autenticação e autorização
 * da aplicação. Implementa as melhores práticas de segurança:
 *
 * - Hash de senhas com bcrypt (salt rounds 12)
 * - Geração e validação de tokens JWT
 * - Validação de dados de entrada
 * - Tratamento seguro de erros
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas lógica de autenticação
 * - Dependency Injection: recebe o repositório como dependência
 * - Error Handling: tratamento adequado de exceções
 */

class ServicoAutenticacao {
  private repositorioUsuario: Repository<Usuario>;
  private chaveSecretaJWT: string;
  private expiracaoToken: string;
  private saltRounds: number;

  constructor() {
    // Inicialização do repositório TypeORM
    this.repositorioUsuario = AppDataSource.getRepository(Usuario);

    // Configurações de segurança do JWT
    // Em produção, essas variáveis devem vir do arquivo .env
    this.chaveSecretaJWT =
      process.env.JWT_SECRET || "sua-chave-super-secreta-aqui";
    this.expiracaoToken = process.env.JWT_EXPIRATION || "24h";

    // Salt rounds para o bcrypt (12 é um bom padrão)
    this.saltRounds = 12;
  }

  /**
   * Registra um novo usuário no sistema
   *
   * @param dadosUsuario - Dados do usuário (nome, email, senha)
   * @returns Promise com o usuário criado (sem a senha)
   *
   * Processo:
   * 1. Valida se o email já existe
   * 2. Gera hash da senha
   * 3. Salva o usuário no banco
   * 4. Remove a senha do retorno (segurança)
   */
  async registrarUsuario(
    dadosUsuario: CriarUsuarioDto
  ): Promise<Omit<Usuario, "senha">> {
    const { nomeCompleto, email, senha } = dadosUsuario;

    // Verifica se já existe um usuário com este email
    const usuarioExistente = await this.repositorioUsuario.findOne({
      where: { email },
    });

    if (usuarioExistente) {
      throw new Error("Email já está em uso");
    }

    // Gera hash seguro da senha
    // O bcrypt adiciona automaticamente o salt
    const senhaHasheada = await bcrypt.hash(senha, this.saltRounds);

    // Cria novo usuário
    const novoUsuario = this.repositorioUsuario.create({
      nomeCompleto,
      email,
      senha: senhaHasheada,
    });

    // Salva no banco de dados
    const usuarioSalvo = await this.repositorioUsuario.save(novoUsuario);

    // Remove a senha do objeto de retorno (nunca enviar hash para o cliente)
    const { senha: _, ...usuarioSemSenha } = usuarioSalvo;

    return usuarioSemSenha;
  }

  /**
   * Autentica um usuário com email e senha
   *
   * @param dadosLogin
   * @returns
   *
   * Processo:
   * 1. Busca usuário pelo email
   * 2. Compara senha fornecida com hash armazenado
   * 3. Gera token JWT com dados do usuário
   * 4. Retorna token e dados do usuário
   */
  async autenticarUsuario(
    dadosLogin: LoginDto
  ): Promise<{ token: string; usuario: Omit<Usuario, "senha"> }> {
    const { email, senha } = dadosLogin;

    // Busca usuário pelo email
    const usuario = await this.repositorioUsuario.findOne({
      where: { email },
    });

    if (!usuario) {
      throw new Error("Credenciais inválidas");
    }

    // Verifica se a senha está correta
    // bcrypt.compare compara a senha em texto plano com o hash
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      throw new Error("Credenciais inválidas");
    }

    // Gera token JWT
    const token = this.gerarTokenJWT(usuario);

    // Remove a senha do objeto de retorno
    const { senha: _, ...usuarioSemSenha } = usuario;

    return {
      token,
      usuario: usuarioSemSenha,
    };
  }

  /**
   * Gera um token JWT para o usuário
   *
   * @param usuario - Dados do usuário autenticado
   * @returns Token JWT assinado
   *
   * O token contém:
   * - ID do usuário
   * - Email do usuário
   * - Timestamp de criação
   * - Expiração configurada
   */
  private gerarTokenJWT(usuario: Usuario): string {
    // Payload do token (dados que queremos incluir)
    const payload = {
      usuarioId: usuario.id,
      email: usuario.email,
      iat: Math.floor(Date.now() / 1000), // issued at (timestamp)
    };

    // Assina o token com a chave secreta
    return jwt.sign(
      payload,
      this.chaveSecretaJWT as jwt.Secret,
      {
        expiresIn: this.expiracaoToken,
      } as jwt.SignOptions
    );
  }

  /**
   * Verifica e decodifica um token JWT
   *
   * @param token - Token JWT para validar
   * @returns Dados decodificados do token
   *
   * Usado pelo middleware de autenticação para validar
   * requisições protegidas
   */
  async verificarToken(token: string): Promise<TokenPayload> {
    try {
      // Verifica e decodifica o token
      const decoded = jwt.verify(token, this.chaveSecretaJWT) as TokenPayload;

      // Verifica se o usuário ainda existe no banco
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
   * Busca um usuário pelo ID
   *
   * @param usuarioId - ID do usuário
   * @returns Dados do usuário (sem senha)
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

    // Remove a senha do retorno
    const { senha: _, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }

  /**
   * Atualiza a senha de um usuário
   *
   * @param usuarioId - ID do usuário
   * @param senhaAtual - Senha atual para validação
   * @param novaSenha - Nova senha
   */
  async atualizarSenha(
    usuarioId: string,
    senhaAtual: string,
    novaSenha: string
  ): Promise<void> {
    // Busca o usuário
    const usuario = await this.repositorioUsuario.findOne({
      where: { id: usuarioId },
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    // Verifica se a senha atual está correta
    const senhaAtualValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaAtualValida) {
      throw new Error("Senha atual incorreta");
    }

    // Gera hash da nova senha
    const novaSenhaHasheada = await bcrypt.hash(novaSenha, this.saltRounds);

    // Atualiza no banco
    await this.repositorioUsuario.update(usuarioId, {
      senha: novaSenhaHasheada,
    });
  }
}

/**
 * Instância única do serviço de autenticação
 *
 * Utilizamos o padrão Singleton para garantir que apenas
 * uma instância do serviço seja criada e reutilizada
 * em toda a aplicação.
 */
export const servicoAutenticacao = new ServicoAutenticacao();
