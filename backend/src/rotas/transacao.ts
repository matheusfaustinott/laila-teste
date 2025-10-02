import { Router } from 'express';
import { 
    listarTransacoes,
    buscarTransacaoPorId,
    criarTransacao,
    atualizarTransacao,
    removerTransacao,
    obterResumoMensal
} from '../controladores/transacao';
import { verificarAutenticacao } from '../middlewares/autenticacao';

/**
 * Rotas de Transações
 * 
 * Este arquivo define todas as rotas relacionadas ao gerenciamento
 * de transações financeiras (receitas e despesas).
 * 
 * Princípios aplicados:
 * - RESTful API: convenções REST para operações CRUD
 * - Authorization: todas as rotas requerem autenticação
 * - Data Ownership: usuário só acessa suas próprias transações
 * - Business Logic: rotas específicas para relatórios financeiros
 * 
 * Todas as rotas são protegidas e requerem token JWT válido.
 */

// Cria uma instância do router do Express
const roteadorTransacao = Router();

/**
 * MIDDLEWARE GLOBAL
 * 
 * Todas as rotas de transações requerem autenticação
 */
roteadorTransacao.use(verificarAutenticacao);

/**
 * GET /transacoes
 * 
 * Lista todas as transações do usuário autenticado
 * Suporta paginação, filtros avançados e busca
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Query parameters opcionais:
 * - limite: número máximo de resultados (1-100, padrão: 10)
 * - pagina: página para paginação (mínimo 1, padrão: 1)
 * - tipo: 'receita' ou 'despesa' para filtrar por tipo
 * - categoriaId: ID da categoria para filtrar
 * - dataInicio: data inicial (formato YYYY-MM-DD)
 * - dataFim: data final (formato YYYY-MM-DD)
 * - busca: termo para buscar no título ou descrição
 * 
 * Exemplo: GET /transacoes?tipo=despesa&categoriaId=123&dataInicio=2024-01-01&limite=20
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "transacoes": [
 *       {
 *         "id": "uuid",
 *         "titulo": "string",
 *         "descricao": "string",
 *         "valor": 150.50,
 *         "tipo": "receita",
 *         "data": "2024-01-15",
 *         "criadoEm": "date",
 *         "categoria": {
 *           "id": "uuid",
 *           "nome": "string"
 *         }
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
 *     "mensagem": "Transações listadas com sucesso"
 *   }
 * }
 */
roteadorTransacao.get('/', listarTransacoes);

/**
 * GET /transacoes/resumo/mensal
 * 
 * Gera resumo mensal das transações
 * Inclui totais, saldos e resumo por categoria
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Query parameters opcionais:
 * - ano: ano do resumo (padrão: ano atual)
 * - mes: mês do resumo 1-12 (padrão: mês atual)
 * 
 * Exemplo: GET /transacoes/resumo/mensal?ano=2024&mes=3
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "resumo": {
 *       "ano": 2024,
 *       "mes": 3,
 *       "totalReceitas": 5000.00,
 *       "totalDespesas": 3500.00,
 *       "saldo": 1500.00,
 *       "quantidadeTransacoes": 25,
 *       "quantidadeReceitas": 10,
 *       "quantidadeDespesas": 15,
 *       "resumoPorCategoria": [
 *         {
 *           "categoria": {
 *             "id": "uuid",
 *             "nome": "Alimentação"
 *           },
 *           "totalReceitas": 0,
 *           "totalDespesas": 800.00,
 *           "quantidadeTransacoes": 8
 *         }
 *       ]
 *     },
 *     "mensagem": "Resumo mensal gerado com sucesso"
 *   }
 * }
 */
roteadorTransacao.get('/resumo/mensal', obterResumoMensal);

/**
 * GET /transacoes/:id
 * 
 * Busca uma transação específica por ID
 * Transação deve pertencer ao usuário autenticado
 * 
 * Parâmetros:
 * id: ID da transação
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "transacao": {
 *       "id": "uuid",
 *       "titulo": "string",
 *       "descricao": "string",
 *       "valor": 150.50,
 *       "tipo": "receita",
 *       "data": "2024-01-15",
 *       "criadoEm": "date",
 *       "categoria": { ... },
 *       "usuario": { ... }
 *     },
 *     "mensagem": "Transação encontrada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Transação não encontrada"
 * }
 */
roteadorTransacao.get('/:id', buscarTransacaoPorId);

/**
 * POST /transacoes
 * 
 * Cria uma nova transação para o usuário autenticado
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * 
 * Body esperado:
 * {
 *   "titulo": "string",        // obrigatório, 2-100 caracteres
 *   "descricao": "string",     // opcional, máximo 500 caracteres
 *   "valor": 150.50,           // obrigatório, número positivo
 *   "tipo": "receita",         // obrigatório, "receita" ou "despesa"
 *   "data": "2024-01-15",      // obrigatório, formato YYYY-MM-DD, não pode ser futura
 *   "categoriaId": "uuid"      // opcional, deve pertencer ao usuário
 * }
 * 
 * Resposta de sucesso (201):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "transacao": {
 *       "id": "uuid",
 *       "titulo": "string",
 *       "descricao": "string",
 *       "valor": 150.50,
 *       "tipo": "receita",
 *       "data": "2024-01-15",
 *       "criadoEm": "date",
 *       "categoria": { ... }
 *     },
 *     "mensagem": "Transação criada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (400):
 * {
 *   "sucesso": false,
 *   "erro": "Dados inválidos",
 *   "detalhes": ["Valor deve ser um número positivo", "Data não pode ser futura"]
 * }
 */
roteadorTransacao.post('/', criarTransacao);

/**
 * PUT /transacoes/:id
 * 
 * Atualiza uma transação existente
 * Transação deve pertencer ao usuário autenticado
 * 
 * Parâmetros:
 * id: ID da transação
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * Content-Type: application/json
 * 
 * Body esperado (campos opcionais):
 * {
 *   "titulo": "string",        // 2-100 caracteres
 *   "descricao": "string",     // máximo 500 caracteres, null para remover
 *   "valor": 200.75,           // número positivo
 *   "tipo": "despesa",         // "receita" ou "despesa"
 *   "data": "2024-01-20",      // formato YYYY-MM-DD, não pode ser futura
 *   "categoriaId": "uuid"      // deve pertencer ao usuário, null para remover
 * }
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "transacao": {
 *       "id": "uuid",
 *       "titulo": "string",
 *       "descricao": "string",
 *       "valor": 200.75,
 *       "tipo": "despesa",
 *       "data": "2024-01-20",
 *       "criadoEm": "date",
 *       "categoria": { ... }
 *     },
 *     "mensagem": "Transação atualizada com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Transação não encontrada"
 * }
 */
roteadorTransacao.put('/:id', atualizarTransacao);

/**
 * DELETE /transacoes/:id
 * 
 * Remove uma transação
 * Transação deve pertencer ao usuário autenticado
 * 
 * Parâmetros:
 * id: ID da transação
 * 
 * Headers obrigatórios:
 * Authorization: Bearer <jwt-token>
 * 
 * Resposta de sucesso (200):
 * {
 *   "sucesso": true,
 *   "dados": {
 *     "mensagem": "Transação removida com sucesso"
 *   }
 * }
 * 
 * Resposta de erro (404):
 * {
 *   "sucesso": false,
 *   "erro": "Transação não encontrada"
 * }
 * 
 * Nota: A remoção é permanente e afetará relatórios e estatísticas
 */
roteadorTransacao.delete('/:id', removerTransacao);

/**
 * Exporta o roteador para ser usado na aplicação principal
 * 
 * Este roteador será montado em /transacoes na aplicação,
 * então as rotas finais serão:
 * - GET /transacoes
 * - GET /transacoes/resumo/mensal
 * - GET /transacoes/:id
 * - POST /transacoes
 * - PUT /transacoes/:id
 * - DELETE /transacoes/:id
 */
export const rotasTransacoes = roteadorTransacao;