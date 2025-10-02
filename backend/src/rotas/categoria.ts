import { Router } from 'express';
import { 
    listarCategorias,
    buscarCategoriaPorId,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    listarCategoriasMaisUsadas
} from '../controladores/categoria';
import { verificarAutenticacao } from '../middlewares/autenticacao';

/**
 * Rotas de Categorias
 * 
 * Este arquivo define todas as rotas relacionadas ao gerenciamento
 * de categorias de transações financeiras.
 * 
 * Princípios aplicados:
 * - RESTful API: convenções REST para operações CRUD
 * - Authorization: todas as rotas requerem autenticação
 * - Data Ownership: usuário só acessa suas próprias categorias
 * - Resource-based: rotas baseadas no recurso 'categorias'
 * 
 * Todas as rotas são protegidas e requerem token JWT válido.
 */

// Cria uma instância do router do Express
const roteadorCategoria = Router();

/**
 * MIDDLEWARE GLOBAL
 * 
 * Todas as rotas de categorias requerem autenticação
 */
roteadorCategoria.use(verificarAutenticacao);

/**
 * GET /categorias
 * 
 * Lista todas as categorias do usuário autenticado
 * Suporta paginação, busca e filtros
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Query parameters opcionais:
 * - limite: número máximo de resultados (1-100, padrão: 10)
 * - pagina: página para paginação (mínimo 1, padrão: 1)
 * - busca: termo para buscar no nome ou descrição
 * 
 * Exemplo: GET /categorias?limite=20&pagina=2&busca=alimentação
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "categorias": [
 *       {
 *         "id": "uuid",
 *         "nome": "string",
 *         "descricao": "string",
 *         "criadoEm": "date"
 *       }
 *     ],
 *     "paginacao": {
 *       "paginaAtual": 1,
 *       "totalPaginas": 5,
 *       "totalItens": 45,
 *       "itensPorPagina": 10,
 *       "temProximaPagina": true,
 *       "temPaginaAnterior": false
 *     },
 *     "mensagem": "Categorias listadas com sucesso"
 *   }
 * }
 */
roteadorCategoria.get('/', listarCategorias);

/**
 * GET /categorias/mais-usadas
 * 
 * Lista categorias mais utilizadas pelo usuário
 * Ordenadas por número de transações
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Query parameters opcionais:
 * - limite: número máximo de categorias (padrão: 5)
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "categorias": [
 *       {
 *         "id": "uuid",
 *         "nome": "string",
 *         "descricao": "string",
 *         "criadoEm": "date",
 *         "totalTransacoes": 25
 *       }
 *     ],
 *     "mensagem": "Categorias mais usadas listadas com sucesso"
 *   }
 * }
 */
roteadorCategoria.get('/mais-usadas', listarCategoriasMaisUsadas);

/**
 * GET /categorias/:id
 * 
 * Busca uma categoria específica por ID
 * Categoria deve pertencer ao usuário autenticado
 * 
 * Parâmetros:
 * id: ID da categoria
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "categoria": {
 *       "id": "uuid",
 *       "nome": "string",
 *       "descricao": "string",
 *       "criadoEm": "date",
 *       "usuario": { ... }
 *     },
 *     "mensagem": "Categoria encontrada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Categoria não encontrada"
 * }
 */
roteadorCategoria.get('/:id', buscarCategoriaPorId);

/**
 * POST /categorias
 * 
 * Cria uma nova categoria para o usuário autenticado
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * 
 * Body esperado:
 * {
 *   "nome": "string",        // obrigatório, 2-50 caracteres, único por usuário
 *   "descricao": "string"    // opcional, máximo 200 caracteres
 * }
 * 
 * Resposta de sucesso (201):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "categoria": {
 *       "id": "uuid",
 *       "nome": "string",
 *       "descricao": "string",
 *       "criadoEm": "date"
 *     },
 *     "mensagem": "Categoria criada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (400):
 * {
 *   "sucesso": false,
 *   "erro": "Dados inválidos",
 *   "detalhes": ["Já existe uma categoria com este nome"]
 * }
 */
roteadorCategoria.post('/', criarCategoria);

/**
 * PUT /categorias/:id
 * 
 * Atualiza uma categoria existente
 * Categoria deve pertencer ao usuário autenticado
 * 
 * Parâmetros:
 * id: ID da categoria
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * 
 * Body esperado (campos opcionais):
 * {
 *   "nome": "string",        // 2-50 caracteres, único por usuário
 *   "descricao": "string"    // máximo 200 caracteres, null para remover
 * }
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "categoria": {
 *       "id": "uuid",
 *       "nome": "string",
 *       "descricao": "string",
 *       "criadoEm": "date"
 *     },
 *     "mensagem": "Categoria atualizada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Categoria não encontrada"
 * }
 */
roteadorCategoria.put('/:id', atualizarCategoria);

/**
 * DELETE /categorias/:id
 * 
 * Remove uma categoria
 * Categoria deve pertencer ao usuário autenticado
 * Não permite remoção se há transações associadas
 * 
 * Parâmetros:
 * id: ID da categoria
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "mensagem": "Categoria removida com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (400):
 * {
 *   "sucesso": false,
 *   "erro": "Não é possível remover categoria que possui transações associadas"
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Categoria não encontrada"
 * }
 * 
 * Nota: Para forçar a remoção de categoria com transações,
 * primeiro remova ou altere a categoria das transações
 */
roteadorCategoria.delete('/:id', removerCategoria);

/**
 * Exporta o roteador para ser usado na aplicação principal
 * 
 * Este roteador será montado em /categorias na aplicação,
 * então as rotas finais serão:
 * - GET /categorias
 * - GET /categorias/mais-usadas
 * - GET /categorias/:id
 * - POST /categorias
 * - PUT /categorias/:id
 * - DELETE /categorias/:id
 */
export const rotasCategorias = roteadorCategoria;