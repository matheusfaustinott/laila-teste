import { Request, Response, NextFunction } from 'express';
import { servicoAutenticacao } from '../servicos/autenticacao';
import { respostaNaoAutorizado, respostaErro } from '../utils/respostas';
import { RequestAutenticado } from '../tipos';

/**
 * Middleware de Autenticação JWT
 * 
 * Este middleware é responsável por verificar se o usuário está autenticado
 * antes de permitir acesso a rotas protegidas.
 * 
 * Princípios aplicados:
 * - Separation of Concerns: separação entre autenticação e lógica de negócio
 * - Fail Fast: retorna erro imediatamente se não autenticado
 * - Security First: validação rigorosa do token
 * 
 * Como usar:
 * - Aplique este middleware em rotas que precisam de autenticação
 * - Após a validação, o objeto `req.usuario` estará disponível
 */

/**
 * Middleware principal de autenticação
 * 
 * Processo de validação:
 * 1. Extrai o token do header Authorization
 * 2. Valida o formato do token (Bearer)
 * 3. Verifica a validade do token JWT
 * 4. Busca os dados do usuário
 * 5. Adiciona os dados do usuário ao request
 * 
 * @param req - Request do Express (será tipado como RequestAutenticado)
 * @param res - Response do Express
 * @param next - Função next do Express
 */
export const verificarAutenticacao = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extrai o header de autorização
        const authHeader = req.headers.authorization;

        // Verifica se o header existe
        if (!authHeader) {
            respostaNaoAutorizado(res, 'Token de acesso não fornecido');
            return;
        }

        // Verifica se o header está no formato correto: "Bearer <token>"
        const partesHeader = authHeader.split(' ');
        
        if (partesHeader.length !== 2 || partesHeader[0] !== 'Bearer') {
            respostaNaoAutorizado(res, 'Formato do token inválido. Use: Bearer <token>');
            return;
        }

        const token = partesHeader[1];

        // Verifica se o token foi fornecido
        if (!token) {
            respostaNaoAutorizado(res, 'Token não fornecido');
            return;
        }

        // Valida o token e extrai os dados
        const dadosToken = await servicoAutenticacao.verificarToken(token);

        // Busca os dados completos do usuário
        const usuario = await servicoAutenticacao.buscarUsuarioPorId(dadosToken.usuarioId);

        if (!usuario) {
            respostaNaoAutorizado(res, 'Usuário não encontrado');
            return;
        }

        // Adiciona os dados do usuário ao request
        // Agora todas as rotas protegidas podem acessar req.usuario
        req.usuario = usuario;
        req.tokenPayload = dadosToken;

        // Chama o próximo middleware/rota
        next();

    } catch (error) {
        // Log do erro para debugging (em produção, use um logger apropriado)
        console.error('Erro na autenticação:', error);

        // Retorna erro de autenticação
        if (error instanceof Error) {
            respostaNaoAutorizado(res, error.message);
        } else {
            respostaNaoAutorizado(res, 'Erro interno de autenticação');
        }
    }
};

/**
 * Middleware opcional para verificar autenticação
 * 
 * Este middleware tenta autenticar o usuário, mas não falha
 * se não houver token. Útil para rotas que podem funcionar
 * tanto para usuários autenticados quanto não autenticados.
 * 
 * Exemplo de uso:
 * - Listagem pública de categorias (pode mostrar mais dados se autenticado)
 * - Páginas que têm comportamento diferente para usuários logados
 */
export const verificarAutenticacaoOpcional = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        // Se não há header, apenas continua sem autenticar
        if (!authHeader) {
            next();
            return;
        }

        const partesHeader = authHeader.split(' ');
        
        // Se formato está incorreto, continua sem autenticar
        if (partesHeader.length !== 2 || partesHeader[0] !== 'Bearer') {
            next();
            return;
        }

        const token = partesHeader[1];

        // Se não há token, continua sem autenticar
        if (!token) {
            next();
            return;
        }

        try {
            // Tenta validar o token
            const dadosToken = await servicoAutenticacao.verificarToken(token);
            const usuario = await servicoAutenticacao.buscarUsuarioPorId(dadosToken.usuarioId);

            if (usuario) {
                // Se conseguiu autenticar, adiciona ao request
                req.usuario = usuario;
                req.tokenPayload = dadosToken;
            }
        } catch (tokenError) {
            // Se falhou na validação do token, apenas continua sem autenticar
            // Não retorna erro, pois a autenticação é opcional
        }

        next();

    } catch (error) {
        // Em caso de erro grave, apenas continua sem autenticar
        console.error('Erro na autenticação opcional:', error);
        next();
    }
};

/**
 * Middleware para verificar se o usuário é admin
 * 
 * Este middleware deve ser usado APÓS o verificarAutenticacao
 * para verificar se o usuário tem privilégios administrativos.
 * 
 * Note: Como não temos campo isAdmin ainda na entidade Usuario,
 * este é um exemplo de como implementaríamos essa verificação.
 */
export const verificarAdmin = async (
    req: RequestAutenticado,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Verifica se o usuário está autenticado (deve ter passado pelo middleware anterior)
    if (!req.usuario) {
        respostaNaoAutorizado(res, 'Usuário não autenticado');
        return;
    }

    // Aqui você implementaria a lógica para verificar se é admin
    // Por exemplo, verificando um campo isAdmin na entidade Usuario
    // ou consultando uma tabela de roles/permissões
    
    // Para este exemplo, vamos assumir que o primeiro usuário é admin
    // Em produção, você teria uma lógica mais robusta
    const isAdmin = req.usuario.id === '1' || req.usuario.email.includes('admin');

    if (!isAdmin) {
        respostaNaoAutorizado(res, 'Acesso negado. Privilégios administrativos necessários.');
        return;
    }

    next();
};

/**
 * Middleware para verificar se o usuário pode acessar um recurso específico
 * 
 * Este middleware verifica se o usuário autenticado tem permissão
 * para acessar um recurso baseado no ID do usuário.
 * 
 * @param req - Request autenticado
 * @param res - Response
 * @param next - Next function
 */
export const verificarProprietarioRecurso = (campoUsuarioId: string = 'usuarioId') => {
    return async (req: RequestAutenticado, res: Response, next: NextFunction): Promise<void> => {
        if (!req.usuario) {
            respostaNaoAutorizado(res, 'Usuário não autenticado');
            return;
        }

        // Extrai o ID do usuário dos parâmetros da URL ou body
        const usuarioIdRecurso = req.params[campoUsuarioId] || req.body[campoUsuarioId];

        // Verifica se o usuário está tentando acessar seus próprios dados
        if (usuarioIdRecurso && usuarioIdRecurso !== req.usuario.id) {
            respostaNaoAutorizado(res, 'Acesso negado. Você só pode acessar seus próprios dados.');
            return;
        }

        next();
    };
};