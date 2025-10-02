import { Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Categoria } from "../modelos/categoria";
import { CriarCategoriaDto } from "../tipos";

class ServicoCategorias {
  private repositorioCategoria: Repository<Categoria>;

  constructor() {
    this.repositorioCategoria = AppDataSource.getRepository(Categoria);
  }

  /**
   * @param usuarioId
   * @param opcoes
   * @returns
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
      incluirEstatisticas = false,
    } = opcoes;

    //query
    const queryBuilder = this.repositorioCategoria
      .createQueryBuilder("categoria")
      .where("categoria.usuarioId = :usuarioId", { usuarioId })
      .orderBy("categoria.criadoEm", "DESC");
    if (incluirEstatisticas) {
      queryBuilder
        .leftJoin("categoria.transacoes", "transacao")
        .addSelect("COUNT(transacao.id)", "totalTransacoes")
        .addSelect(
          "COALESCE(SUM(CASE WHEN transacao.tipo = 'receita' THEN transacao.valor ELSE 0 END), 0)",
          "totalReceitas"
        )
        .addSelect(
          "COALESCE(SUM(CASE WHEN transacao.tipo = 'despesa' THEN transacao.valor ELSE 0 END), 0)",
          "totalDespesas"
        )
        .groupBy("categoria.id");
    }
    if (busca) {
      queryBuilder.andWhere(
        "(categoria.nome ILIKE :busca OR categoria.descricao ILIKE :busca)",
        { busca: `%${busca}%` }
      );
    }
    const total = await queryBuilder.getCount();
    const offset = (pagina - 1) * limite;
    queryBuilder.skip(offset).take(limite);
    const categorias = incluirEstatisticas
      ? await queryBuilder.getRawAndEntities()
      : await queryBuilder.getMany();
    const totalPaginas = Math.ceil(total / limite);
    const temProximaPagina = pagina < totalPaginas;
    const temPaginaAnterior = pagina > 1;

    return {
      categorias: incluirEstatisticas
        ? (categorias as any).entities
        : categorias,
      total,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalItens: total,
        itensPorPagina: limite,
        temProximaPagina,
        temPaginaAnterior,
      },
    };
  }

  /**
   * @param categoriaId
   * @param usuarioId
   * @param incluirTransacoes
   * @returns
   */
  async buscarCategoriaPorId(
    categoriaId: string,
    usuarioId: string,
    incluirTransacoes: boolean = false
  ): Promise<Categoria | null> {
    const relations = incluirTransacoes ? ["transacoes"] : [];

    return await this.repositorioCategoria.findOne({
      where: {
        id: categoriaId,
        usuario: { id: usuarioId },
      },
      relations,
    });
  }

  /**
   * @param dadosCategoria
   * @param usuarioId
   * @returns
   */
  async criarCategoria(
    dadosCategoria: CriarCategoriaDto,
    usuarioId: string
  ): Promise<Categoria> {
    const { nome, descricao } = dadosCategoria;
    await this.validarNomeUnico(nome, usuarioId);
    const novaCategoria = this.repositorioCategoria.create({
      nome: nome.trim(),
      descricao: descricao?.trim(),
      usuario: { id: usuarioId },
    });

    return await this.repositorioCategoria.save(novaCategoria);
  }

  /**
   * @param categoriaId
   * @param dadosAtualizacao
   * @param usuarioId
   * @returns
   */
  async atualizarCategoria(
    categoriaId: string,
    dadosAtualizacao: Partial<CriarCategoriaDto>,
    usuarioId: string
  ): Promise<Categoria> {
    const categoria = await this.buscarCategoriaPorId(categoriaId, usuarioId);

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }
    if (dadosAtualizacao.nome && dadosAtualizacao.nome !== categoria.nome) {
      await this.validarNomeUnico(
        dadosAtualizacao.nome,
        usuarioId,
        categoriaId
      );
    }
    if (dadosAtualizacao.nome !== undefined) {
      categoria.nome = dadosAtualizacao.nome.trim();
    }
    if (dadosAtualizacao.descricao !== undefined) {
      categoria.descricao = dadosAtualizacao.descricao?.trim() || undefined;
    }

    return await this.repositorioCategoria.save(categoria);
  }

  /**
   *
   * @param categoriaId
   * @param usuarioId
   * @param forcarRemocao
   * @returns
   */
  async removerCategoria(
    categoriaId: string,
    usuarioId: string,
    forcarRemocao: boolean = false
  ): Promise<void> {
    const categoria = await this.buscarCategoriaPorId(
      categoriaId,
      usuarioId,
      true
    );

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }
    if (
      !forcarRemocao &&
      categoria.transacoes &&
      categoria.transacoes.length > 0
    ) {
      throw new Error(
        "Não é possível remover categoria que possui transações associadas. " +
          "Remova ou altere a categoria das transações primeiro."
      );
    }
    if (
      forcarRemocao &&
      categoria.transacoes &&
      categoria.transacoes.length > 0
    ) {
      // podemos futuramente tratar como a transasao vai ficar caso a categoria dela for removida
      await this.repositorioCategoria
        .createQueryBuilder()
        .update("transacao")
        .set({ categoria: null })
        .where("categoriaId = :categoriaId", { categoriaId })
        .execute();
    }
    await this.repositorioCategoria.remove(categoria);
  }

  /**
   *
   * @param usuarioId
   * @param limite
   * @returns
   */
  async listarCategoriasMaisUsadas(
    usuarioId: string,
    limite: number = 5
  ): Promise<
    Array<{
      categoria: Categoria;
      totalTransacoes: number;
      totalReceitas: number;
      totalDespesas: number;
    }>
  > {
    const resultados = await this.repositorioCategoria
      .createQueryBuilder("categoria")
      .leftJoin("categoria.transacoes", "transacao")
      .where("categoria.usuarioId = :usuarioId", { usuarioId })
      .groupBy("categoria.id")
      .orderBy("COUNT(transacao.id)", "DESC")
      .addOrderBy("categoria.nome", "ASC")
      .limit(limite)
      .select([
        "categoria",
        "COUNT(transacao.id) as totalTransacoes",
        "COALESCE(SUM(CASE WHEN transacao.tipo = 'receita' THEN transacao.valor ELSE 0 END), 0) as totalReceitas",
        "COALESCE(SUM(CASE WHEN transacao.tipo = 'despesa' THEN transacao.valor ELSE 0 END), 0) as totalDespesas",
      ])
      .getRawAndEntities();

    return resultados.entities.map((categoria, index) => ({
      categoria,
      totalTransacoes: parseInt(resultados.raw[index].totalTransacoes) || 0,
      totalReceitas: parseFloat(resultados.raw[index].totalReceitas) || 0,
      totalDespesas: parseFloat(resultados.raw[index].totalDespesas) || 0,
    }));
  }

  /**

     * @param nome
     * @param usuarioId
     * @param categoriaIdExcluir
     * @throws
     */
  private async validarNomeUnico(
    nome: string,
    usuarioId: string,
    categoriaIdExcluir?: string
  ): Promise<void> {
    const queryBuilder = this.repositorioCategoria
      .createQueryBuilder("categoria")
      .where("categoria.nome = :nome", { nome: nome.trim() })
      .andWhere("categoria.usuarioId = :usuarioId", { usuarioId });

    if (categoriaIdExcluir) {
      queryBuilder.andWhere("categoria.id != :categoriaId", {
        categoriaId: categoriaIdExcluir,
      });
    }

    const categoriaExistente = await queryBuilder.getOne();

    if (categoriaExistente) {
      throw new Error("Já existe uma categoria com este nome");
    }
  }
}

export const servicoCategorias = new ServicoCategorias();
