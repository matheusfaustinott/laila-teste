import { Router } from 'express';
import { 
    buscarUsuarioPorId,
    atualizarUsuario,
    removerUsuario,
    buscarMeuPerfil,
    buscarEstatisticasUsuario
} from '../controladores/usuario';
import { verificarAutenticacao } from '../middlewares/autenticacao';

/**
 * Rotas de Usuário
 * 
 * Este arquivo define todas as rotas relacionadas ao gerenciamento
 * de usuários (exceto autenticação que está em rotas separadas).
 * 
 * Princípios aplicados:
 * - RESTful API: seguindo convenções REST
 * - Authorization: todas as rotas requerem autenticação
 * - Resource-based: rotas baseadas no recurso 'usuarios'
 * - Security: proteção de dados pessoais
 * 
 * Todas as rotas são protegidas e requerem token JWT válido.
 */

// Cria uma instância do router do Express
const roteadorUsuario = Router();

/**
 * MIDDLEWARE GLOBAL
 * 
 * Todas as rotas de usuário requerem autenticação
 */
roteadorUsuario.use(verificarAutenticacao);

/**
 * GET /usuarios/me
 * 
 * Atalho para buscar dados do usuário autenticado
 * Mais conveniente que /usuarios/:id pois não requer o ID
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "usuario": {
 *       "id": "uuid",
 *       "nomeCompleto": "string",
 *       "email": "string",
 *       "criadoEm": "date"
 *     },
 *     "mensagem": "Dados do perfil recuperados com sucesso"
 *   }
 * }
 */
roteadorUsuario.get('/me', buscarMeuPerfil);

/**
 * GET /usuarios/me/estatisticas
 * 
 * Busca estatísticas básicas do usuário autenticado
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "estatisticas": {
 *       "dataCadastro": "date",
 *       "totalTransacoes": "number",
 *       "totalCategorias": "number",
 *       "ultimaAtividade": "date"
 *     },
 *     "mensagem": "Estatísticas recuperadas com sucesso"
 *   }
 * }
 */
roteadorUsuario.get('/me/estatisticas', buscarEstatisticasUsuario);

/**
 * GET /usuarios/:id
 * 
 * Busca um usuário específico por ID
 * Usuário só pode buscar seus próprios dados
 * 
 * Parâmetros:
 * id: ID do usuário (deve ser o mesmo do token JWT)
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "usuario": { ... },
 *     "mensagem": "Usuário encontrado com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (403):
 * {
 *   "sucesso": false,
 *   "erro": "Você só pode acessar seus próprios dados"
 * }
 */
roteadorUsuario.get('/:id', buscarUsuarioPorId);

/**
 * PUT /usuarios/:id
 * 
 * Atualiza dados do usuário
 * Usuário só pode atualizar seus próprios dados
 * 
 * Parâmetros:
 * id: ID do usuário (deve ser o mesmo do token JWT)
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * 
 * Body esperado (campos opcionais):
 * {
 *   "nomeCompleto": "string",  // mínimo 2 caracteres
 *   "email": "string"          // email válido e único
 * }
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "usuario": { ... },
 *     "mensagem": "Usuário atualizado com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (400):
 * {
 *   "sucesso": false,
 *   "erro": "Dados inválidos",
 *   "detalhes": ["Email já está em uso"]
 * }
 */
roteadorUsuario.put('/:id', atualizarUsuario);

/**
 * DELETE /usuarios/:id
 * 
 * Remove conta do usuário (soft delete)
 * Usuário só pode remover sua própria conta
 * 
 * Parâmetros:
 * id: ID do usuário (deve ser o mesmo do token JWT)
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "mensagem": "Conta removida com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (403):
 * {
 *   "sucesso": false,
 *   "erro": "Você só pode remover sua própria conta"
 * }
 * 
 * Nota: A remoção preserva dados históricos de transações
 * para manter integridade dos dados financeiros
 */
roteadorUsuario.delete('/:id', removerUsuario);

/**
 * Exporta o roteador para ser usado na aplicação principal
 * 
 * Este roteador será montado em /usuarios na aplicação,
 * então as rotas finais serão:
 * - GET /usuarios/me
 * - GET /usuarios/me/estatisticas
 * - GET /usuarios/:id
 * - PUT /usuarios/:id
 * - DELETE /usuarios/:id
 */
export const rotasUsuario = roteadorUsuario;