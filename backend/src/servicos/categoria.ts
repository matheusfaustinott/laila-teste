import { Repository } from 'typeorm';
import { AppDataSource } from '../database/db';
import { Categoria } from '../modelos/categoria';
import { CriarCategoriaDto } from '../tipos';

/**
 * Serviço de Categorias
 * 
 * Este serviço contém toda a lógica de negócio relacionada
 * às categorias de transações financeiras.
 * 
 * Princípios aplicados:
 * - Single Responsibility: apenas lógica de negócio de categorias
 * - Data Access Layer: abstração do acesso ao banco de dados
 * - Business Rules: implementação das regras de negócio
 * - Error Handling: tratamento adequado de exceções
 * 
 * Responsabilidades:
 * - Validação de regras de negócio específicas
 * - Operações complexas que envolvem múltiplas entidades
 * - Cálculos e estatísticas
 * - Transformação de dados
 */

class ServicoCategorias {
    private repositorioCategoria: Repository<Categoria>;

    constructor() {
        this.repositorioCategoria = AppDataSource.getRepository(Categoria);
    }

    /**
     * Lista categorias do usuário com opções de filtro e paginação
     * 
     * @param usuarioId - ID do usuário
     * @param opcoes - Opções de filtro e paginação
     * @returns Promise com categorias e metadados de paginação
     */
    async listarCategorias(
        usuarioId: string,
        opcoes: {
            limite?: number;
            pagina?: number;
            busca?: string;
            incluirEstatisticas?: boolean;
        } = {}
    ): Promise<{
        categorias: Categoria[];
        total: number;
        paginacao: {
            paginaAtual: number;
            totalPaginas: number;
            totalItens: number;
            itensPorPagina: number;
            temProximaPagina: boolean;
            temPaginaAnterior: boolean;
        };
    }> {
        const {
            limite = 10,
            pagina = 1,
            busca,
            incluirEstatisticas = false
        } = opcoes;

        // Constrói a query base
        const queryBuilder = this.repositorioCategoria
            .createQueryBuilder('categoria')
            .where('categoria.usuarioId = :usuarioId', { usuarioId })
            .orderBy('categoria.criadoEm', 'DESC');

        // Adiciona estatísticas se solicitado
        if (incluirEstatisticas) {
            queryBuilder
                .leftJoin('categoria.transacoes', 'transacao')
                .addSelect('COUNT(transacao.id)', 'totalTransacoes')
                .addSelect('COALESCE(SUM(CASE WHEN transacao.tipo = \'receita\' THEN transacao.valor ELSE 0 END), 0)', 'totalReceitas')
                .addSelect('COALESCE(SUM(CASE WHEN transacao.tipo = \'despesa\' THEN transacao.valor ELSE 0 END), 0)', 'totalDespesas')
                .groupBy('categoria.id');
        }

        // Adiciona busca se fornecida
        if (busca) {
            queryBuilder.andWhere(
                '(categoria.nome ILIKE :busca OR categoria.descricao ILIKE :busca)',
                { busca: `%${busca}%` }
            );
        }

        // Conta total para paginação
        const total = await queryBuilder.getCount();

        // Aplica paginação
        const offset = (pagina - 1) * limite;
        queryBuilder.skip(offset).take(limite);

        // Executa a query
        const categorias = incluirEstatisticas 
            ? await queryBuilder.getRawAndEntities()
            : await queryBuilder.getMany();

        // Calcula informações de paginação
        const totalPaginas = Math.ceil(total / limite);
        const temProximaPagina = pagina < totalPaginas;
        const temPaginaAnterior = pagina > 1;

        return {
            categorias: incluirEstatisticas ? (categorias as any).entities : categorias,
            total,
            paginacao: {
                paginaAtual: pagina,
                totalPaginas,
                totalItens: total,
                itensPorPagina: limite,
                temProximaPagina,
                temPaginaAnterior
            }
        };
    }

    /**
     * Busca uma categoria por ID garantindo que pertence ao usuário
     * 
     * @param categoriaId - ID da categoria
     * @param usuarioId - ID do usuário
     * @param incluirTransacoes - Se deve incluir transações relacionadas
     * @returns Promise com a categoria ou null se não encontrada
     */
    async buscarCategoriaPorId(
        categoriaId: string, 
        usuarioId: string,
        incluirTransacoes: boolean = false
    ): Promise<Categoria | null> {
        const relations = incluirTransacoes ? ['transacoes'] : [];

        return await this.repositorioCategoria.findOne({
            where: { 
                id: categoriaId, 
                usuario: { id: usuarioId } 
            },
            relations
        });
    }

    /**
     * Cria uma nova categoria
     * 
     * @param dadosCategoria - Dados da categoria
     * @param usuarioId - ID do usuário
     * @returns Promise com a categoria criada
     */
    async criarCategoria(dadosCategoria: CriarCategoriaDto, usuarioId: string): Promise<Categoria> {
        const { nome, descricao } = dadosCategoria;

        // Verifica se já existe categoria com mesmo nome para o usuário
        await this.validarNomeUnico(nome, usuarioId);

        // Cria nova categoria
        const novaCategoria = this.repositorioCategoria.create({
            nome: nome.trim(),
            descricao: descricao?.trim(),
            usuario: { id: usuarioId }
        });

        return await this.repositorioCategoria.save(novaCategoria);
    }

    /**
     * Atualiza uma categoria existente
     * 
     * @param categoriaId - ID da categoria
     * @param dadosAtualizacao - Novos dados da categoria
     * @param usuarioId - ID do usuário
     * @returns Promise com a categoria atualizada
     */
    async atualizarCategoria(
        categoriaId: string,
        dadosAtualizacao: Partial<CriarCategoriaDto>,
        usuarioId: string
    ): Promise<Categoria> {
        // Busca a categoria
        const categoria = await this.buscarCategoriaPorId(categoriaId, usuarioId);

        if (!categoria) {
            throw new Error('Categoria não encontrada');
        }

        // Se está atualizando o nome, verifica unicidade
        if (dadosAtualizacao.nome && dadosAtualizacao.nome !== categoria.nome) {
            await this.validarNomeUnico(dadosAtualizacao.nome, usuarioId, categoriaId);
        }

        // Atualiza os campos
        if (dadosAtualizacao.nome !== undefined) {
            categoria.nome = dadosAtualizacao.nome.trim();
        }
        if (dadosAtualizacao.descricao !== undefined) {
            categoria.descricao = dadosAtualizacao.descricao?.trim() || undefined;
        }

        return await this.repositorioCategoria.save(categoria);
    }

    /**
     * Remove uma categoria
     * 
     * @param categoriaId - ID da categoria
     * @param usuarioId - ID do usuário
     * @param forcarRemocao - Se true, remove mesmo com transações associadas
     * @returns Promise void
     */
    async removerCategoria(
        categoriaId: string, 
        usuarioId: string,
        forcarRemocao: boolean = false
    ): Promise<void> {
        // Busca a categoria com transações
        const categoria = await this.buscarCategoriaPorId(categoriaId, usuarioId, true);

        if (!categoria) {
            throw new Error('Categoria não encontrada');
        }

        // Verifica se há transações associadas
        if (!forcarRemocao && categoria.transacoes && categoria.transacoes.length > 0) {
            throw new Error(
                'Não é possível remover categoria que possui transações associadas. ' +
                'Remova ou altere a categoria das transações primeiro.'
            );
        }

        // Se forçar remoção, primeiro remove a associação com transações
        if (forcarRemocao && categoria.transacoes && categoria.transacoes.length > 0) {
            // Aqui você implementaria a lógica para lidar com as transações
            // Por exemplo, mover para uma categoria "Sem categoria" ou remover a referência
            await this.repositorioCategoria
                .createQueryBuilder()
                .update('transacao')
                .set({ categoria: null })
                .where('categoriaId = :categoriaId', { categoriaId })
                .execute();
        }

        // Remove a categoria
        await this.repositorioCategoria.remove(categoria);
    }

    /**
     * Lista as categorias mais utilizadas pelo usuário
     * 
     * @param usuarioId - ID do usuário
     * @param limite - Número máximo de categorias a retornar
     * @returns Promise com categorias ordenadas por uso
     */
    async listarCategoriasMaisUsadas(usuarioId: string, limite: number = 5): Promise<Array<{
        categoria: Categoria;
        totalTransacoes: number;
        totalReceitas: number;
        totalDespesas: number;
    }>> {
        const resultados = await this.repositorioCategoria
            .createQueryBuilder('categoria')
            .leftJoin('categoria.transacoes', 'transacao')
            .where('categoria.usuarioId = :usuarioId', { usuarioId })
            .groupBy('categoria.id')
            .orderBy('COUNT(transacao.id)', 'DESC')
            .addOrderBy('categoria.nome', 'ASC')
            .limit(limite)
            .select([
                'categoria',
                'COUNT(transacao.id) as totalTransacoes',
                'COALESCE(SUM(CASE WHEN transacao.tipo = \'receita\' THEN transacao.valor ELSE 0 END), 0) as totalReceitas',
                'COALESCE(SUM(CASE WHEN transacao.tipo = \'despesa\' THEN transacao.valor ELSE 0 END), 0) as totalDespesas'
            ])
            .getRawAndEntities();

        return resultados.entities.map((categoria, index) => ({
            categoria,
            totalTransacoes: parseInt(resultados.raw[index].totalTransacoes) || 0,
            totalReceitas: parseFloat(resultados.raw[index].totalReceitas) || 0,
            totalDespesas: parseFloat(resultados.raw[index].totalDespesas) || 0
        }));
    }

    /**
     * Obtém estatísticas gerais das categorias do usuário
     * 
     * @param usuarioId - ID do usuário
     * @returns Promise com estatísticas das categorias
     */
    async obterEstatisticasCategorias(usuarioId: string): Promise<{
        totalCategorias: number;
        categoriasMaisUsadas: number;
        categoriasComTransacoes: number;
        categoriasSemTransacoes: number;
        mediaTransacoesPorCategoria: number;
    }> {
        // Total de categorias
        const totalCategorias = await this.repositorioCategoria.count({
            where: { usuario: { id: usuarioId } }
        });

        // Categorias com e sem transações
        const categoriasComEstatisticas = await this.repositorioCategoria
            .createQueryBuilder('categoria')
            .leftJoin('categoria.transacoes', 'transacao')
            .where('categoria.usuarioId = :usuarioId', { usuarioId })
            .groupBy('categoria.id')
            .select([
                'categoria.id',
                'COUNT(transacao.id) as totalTransacoes'
            ])
            .getRawMany();

        const categoriasComTransacoes = categoriasComEstatisticas.filter(
            c => parseInt(c.totalTransacoes) > 0
        ).length;

        const categoriasSemTransacoes = totalCategorias - categoriasComTransacoes;

        const totalTransacoes = categoriasComEstatisticas.reduce(
            (total, c) => total + parseInt(c.totalTransacoes), 0
        );

        const mediaTransacoesPorCategoria = totalCategorias > 0 
            ? Math.round(totalTransacoes / totalCategorias * 100) / 100 
            : 0;

        return {
            totalCategorias,
            categoriasMaisUsadas: Math.min(5, categoriasComTransacoes),
            categoriasComTransacoes,
            categoriasSemTransacoes,
            mediaTransacoesPorCategoria
        };
    }

    /**
     * Duplica uma categoria existente
     * 
     * @param categoriaId - ID da categoria a duplicar
     * @param usuarioId - ID do usuário
     * @param novoNome - Novo nome para a categoria duplicada
     * @returns Promise com a categoria duplicada
     */
    async duplicarCategoria(
        categoriaId: string, 
        usuarioId: string, 
        novoNome?: string
    ): Promise<Categoria> {
        // Busca a categoria original
        const categoriaOriginal = await this.buscarCategoriaPorId(categoriaId, usuarioId);

        if (!categoriaOriginal) {
            throw new Error('Categoria não encontrada');
        }

        // Define nome da cópia
        const nomeNovo = novoNome || `${categoriaOriginal.nome} (Cópia)`;

        // Verifica unicidade do nome
        await this.validarNomeUnico(nomeNovo, usuarioId);

        // Cria a categoria duplicada
        const categoriaDuplicada = this.repositorioCategoria.create({
            nome: nomeNovo,
            descricao: categoriaOriginal.descricao,
            usuario: { id: usuarioId }
        });

        return await this.repositorioCategoria.save(categoriaDuplicada);
    }

    // === MÉTODOS PRIVADOS ===

    /**
     * Valida se o nome da categoria é único para o usuário
     * 
     * @param nome - Nome da categoria
     * @param usuarioId - ID do usuário
     * @param categoriaIdExcluir - ID da categoria a excluir da validação (para updates)
     * @throws Error se nome já existe
     */
    private async validarNomeUnico(
        nome: string, 
        usuarioId: string, 
        categoriaIdExcluir?: string
    ): Promise<void> {
        const queryBuilder = this.repositorioCategoria
            .createQueryBuilder('categoria')
            .where('categoria.nome = :nome', { nome: nome.trim() })
            .andWhere('categoria.usuarioId = :usuarioId', { usuarioId });

        if (categoriaIdExcluir) {
            queryBuilder.andWhere('categoria.id != :categoriaId', { categoriaId: categoriaIdExcluir });
        }

        const categoriaExistente = await queryBuilder.getOne();

        if (categoriaExistente) {
            throw new Error('Já existe uma categoria com este nome');
        }
    }
}

/**
 * Instância única do serviço de categorias
 * 
 * Utilizamos o padrão Singleton para garantir que apenas
 * uma instância do serviço seja criada e reutilizada
 * em toda a aplicação.
 */
export const servicoCategorias = new ServicoCategorias();