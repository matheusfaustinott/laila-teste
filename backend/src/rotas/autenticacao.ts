import { Router } from 'express';
import { 
    registrarUsuario, 
    logarUsuario, 
    buscarPerfil, 
    atualizarSenha,
    deslogarUsuario 
} from '../controladores/autenticacao';
import { verificarAutenticacao } from '../middlewares/autenticacao';

/**
 * Rotas de Autenticação
 * 
 * Este arquivo define todas as rotas relacionadas à autenticação
 * de usuários na aplicação.
 * 
 * Princípios aplicados:
 * - RESTful API: seguindo convenções REST
 * - Separation of Concerns: apenas definição de rotas
 * - Security: middlewares de autenticação onde necessário
 * - Clear Naming: nomes de rotas claros e intuitivos
 * 
 * Estrutura das rotas:
 * - Rotas públicas: /registrar, /login
 * - Rotas protegidas: /perfil, /atualizar-senha, /logout
 */

// Cria uma instância do router do Express
const roteadorAutenticacao = Router();

/**
 * ROTAS PÚBLICAS
 * 
 * Estas rotas não requerem autenticação e podem ser
 * acessadas por qualquer cliente.
 */

/**
 * POST /auth/registrar
 * 
 * Registra um novo usuário no sistema
 * 
 * Body esperado:
 * {
 *   "nomeCompleto": "string",
 *   "email": "string",
 *   "senha": "string"
 * }
 * 
 * Resposta de sucesso (201):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "usuario": { ... },
 *     "mensagem": "Usuário registrado com sucesso"
 *   }
 * }
 */
roteadorAutenticacao.post('/registrar', registrarUsuario);

/**
 * POST /auth/login
 * 
 * Autentica um usuário existente
 * 
 * Body esperado:
 * {
 *   "email": "string",
 *   "senha": "string"
 * }
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "token": "jwt-token-aqui",
 *     "usuario": { ... },
 *     "mensagem": "Login realizado com sucesso"
 *   }
 * }
 */
roteadorAutenticacao.post('/login', logarUsuario);

/**
 * ROTAS PROTEGIDAS
 * 
 * Estas rotas requerem autenticação via token JWT.
 * O middleware verificarAutenticacao é aplicado para
 * validar o token antes de executar o controlador.
 */

/**
 * GET /auth/perfil
 * 
 * Busca dados do perfil do usuário autenticado
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "usuario": { ... },
 *     "mensagem": "Perfil recuperado com sucesso"
 *   }
 * }
 */
roteadorAutenticacao.get('/perfil', verificarAutenticacao, buscarPerfil);

/**
 * PUT /auth/atualizar-senha
 * 
 * Atualiza a senha do usuário autenticado
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Body esperado:
 * {
 *   "senhaAtual": "string",
 *   "novaSenha": "string"
 * }
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "mensagem": "Senha atualizada com sucesso"
 *   }
 * }
 */
roteadorAutenticacao.put('/atualizar-senha', verificarAutenticacao, atualizarSenha);

/**
 * POST /auth/logout
 * 
 * Realiza logout do usuário (lado servidor)
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "mensagem": "Logout realizado com sucesso"
 *   }
 * }
 * 
 * Nota: Como JWT é stateless, o logout efetivo acontece
 * no lado cliente removendo o token. Este endpoint serve
 * para confirmar o logout e fazer limpezas se necessário.
 */
roteadorAutenticacao.post('/logout', verificarAutenticacao, deslogarUsuario);

/**
 * Exporta o roteador para ser usado na aplicação principal
 * 
 * Este roteador será montado em /auth na aplicação,
 * então as rotas finais serão:
 * - POST /auth/registrar
 * - POST /auth/login
 * - GET /auth/perfil
 * - PUT /auth/atualizar-senha
 * - POST /auth/logout
 */
export const rotasAutenticacao = roteadorAutenticacao;