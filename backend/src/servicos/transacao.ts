import { Between, Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Categoria } from "../modelos/categoria";
import { Transacao } from "../modelos/transacao";
import { CriarTransacaoDto, ResumoMensalDto } from "../tipos";

/**
 * Serviço de Transações
 *
 * Este serviço contém toda a lógica de negócio relacionada
 * às transações financeiras do usuário.
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas lógica de negócio de transações
 * - Business Logic: cálculos financeiros e estatísticas
 * - Data Integrity: validação de integridade dos dados
 * - Performance: otimização de queries complexas
 *
 * Responsabilidades:
 * - Operações CRUD de transações
 * - Cálculos de resumos financeiros
 * - Estatísticas e relatórios
 * - Validação de regras de negócio
 */

class ServicoTransacoes {
  private repositorioTransacao: Repository<Transacao>;
  private repositorioCategoria: Repository<Categoria>;

  constructor() {
    this.repositorioTransacao = AppDataSource.getRepository(Transacao);
    this.repositorioCategoria = AppDataSource.getRepository(Categoria);
  }

  /**
   * Lista transações do usuário com filtros avançados
   *
   * @param usuarioId - ID do usuário
   * @param filtros - Opções de filtro e paginação
   * @returns Promise com transações e metadados
   */
  async listarTransacoes(
    usuarioId: string,
    filtros: {
      limite?: number;
      pagina?: number;
      tipo?: "receita" | "despesa";
      categoriaId?: string;
      dataInicio?: string;
      dataFim?: string;
      busca?: string;
      ordenacao?: "data" | "valor" | "titulo";
      direcaoOrdenacao?: "ASC" | "DESC";
    } = {}
  ): Promise<{
    transacoes: Transacao[];
    total: number;
    resumo: {
      totalReceitas: number;
      totalDespesas: number;
      saldo: number;
    };
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
      tipo,
      categoriaId,
      dataInicio,
      dataFim,
      busca,
      ordenacao = "data",
      direcaoOrdenacao = "DESC",
    } = filtros;

    // Constrói a query base
    const queryBuilder = this.repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .where("transacao.usuarioId = :usuarioId", { usuarioId });

    // Aplica filtros
    if (tipo) {
      queryBuilder.andWhere("transacao.tipo = :tipo", { tipo });
    }

    if (categoriaId) {
      queryBuilder.andWhere("transacao.categoriaId = :categoriaId", {
        categoriaId,
      });
    }

    if (dataInicio && dataFim) {
      queryBuilder.andWhere("transacao.data BETWEEN :dataInicio AND :dataFim", {
        dataInicio,
        dataFim,
      });
    } else if (dataInicio) {
      queryBuilder.andWhere("transacao.data >= :dataInicio", { dataInicio });
    } else if (dataFim) {
      queryBuilder.andWhere("transacao.data <= :dataFim", { dataFim });
    }

    if (busca) {
      queryBuilder.andWhere(
        "(transacao.titulo ILIKE :busca OR transacao.descricao ILIKE :busca)",
        { busca: `%${busca}%` }
      );
    }

    // Aplica ordenação
    const campoOrdenacao =
      ordenacao === "data"
        ? "transacao.data"
        : ordenacao === "valor"
        ? "transacao.valor"
        : "transacao.titulo";

    queryBuilder.orderBy(campoOrdenacao, direcaoOrdenacao);

    // Se ordenação não é por data, adiciona data como ordenação secundária
    if (ordenacao !== "data") {
      queryBuilder.addOrderBy("transacao.data", "DESC");
    }

    // Conta total e calcula resumo
    const transacoesTodas = await queryBuilder.getMany();
    const total = transacoesTodas.length;

    const resumo = this.calcularResumoTransacoes(transacoesTodas);

    // Aplica paginação
    const offset = (pagina - 1) * limite;
    const transacoes = await queryBuilder.skip(offset).take(limite).getMany();

    // Calcula informações de paginação
    const totalPaginas = Math.ceil(total / limite);
    const temProximaPagina = pagina < totalPaginas;
    const temPaginaAnterior = pagina > 1;

    return {
      transacoes,
      total,
      resumo,
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
   * Busca uma transação por ID garantindo que pertence ao usuário
   *
   * @param transacaoId - ID da transação
   * @param usuarioId - ID do usuário
   * @returns Promise com a transação ou null se não encontrada
   */
  async buscarTransacaoPorId(
    transacaoId: string,
    usuarioId: string
  ): Promise<Transacao | null> {
    return await this.repositorioTransacao.findOne({
      where: {
        id: transacaoId,
        usuario: { id: usuarioId },
      },
      relations: ["categoria", "usuario"],
    });
  }

  /**
   * Cria uma nova transação
   *
   * @param dadosTransacao - Dados da transação
   * @param usuarioId - ID do usuário
   * @returns Promise com a transação criada
   */
  async criarTransacao(
    dadosTransacao: CriarTransacaoDto,
    usuarioId: string
  ): Promise<Transacao> {
    const { titulo, descricao, valor, tipo, data, categoriaId } =
      dadosTransacao;

    // Valida categoria se fornecida
    if (categoriaId) {
      await this.validarCategoria(categoriaId, usuarioId);
    }

    // Cria nova transação
    const novaTransacao = this.repositorioTransacao.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim(),
      valor: parseFloat(valor.toString()),
      tipo: tipo.toLowerCase() as "receita" | "despesa",
      data: new Date(data),
      usuario: { id: usuarioId },
      categoria: categoriaId ? { id: categoriaId } : undefined,
    });

    // Salva e retorna com relacionamentos
    const transacaoSalva = await this.repositorioTransacao.save(novaTransacao);

    return (await this.repositorioTransacao.findOne({
      where: { id: transacaoSalva.id },
      relations: ["categoria"],
    })) as Transacao;
  }

  /**
   * Atualiza uma transação existente
   *
   * @param transacaoId - ID da transação
   * @param dadosAtualizacao - Novos dados da transação
   * @param usuarioId - ID do usuário
   * @returns Promise com a transação atualizada
   */
  async atualizarTransacao(
    transacaoId: string,
    dadosAtualizacao: Partial<CriarTransacaoDto>,
    usuarioId: string
  ): Promise<Transacao> {
    // Busca a transação
    const transacao = await this.buscarTransacaoPorId(transacaoId, usuarioId);

    if (!transacao) {
      throw new Error("Transação não encontrada");
    }

    // Valida categoria se fornecida
    if (
      dadosAtualizacao.categoriaId !== undefined &&
      dadosAtualizacao.categoriaId !== null
    ) {
      await this.validarCategoria(dadosAtualizacao.categoriaId, usuarioId);
    }

    // Atualiza os campos fornecidos
    if (dadosAtualizacao.titulo !== undefined) {
      transacao.titulo = dadosAtualizacao.titulo.trim();
    }
    if (dadosAtualizacao.descricao !== undefined) {
      transacao.descricao = dadosAtualizacao.descricao?.trim() || undefined;
    }
    if (dadosAtualizacao.valor !== undefined) {
      transacao.valor = parseFloat(dadosAtualizacao.valor.toString());
    }
    if (dadosAtualizacao.tipo !== undefined) {
      transacao.tipo = dadosAtualizacao.tipo.toLowerCase() as
        | "receita"
        | "despesa";
    }
    if (dadosAtualizacao.data !== undefined) {
      transacao.data = new Date(dadosAtualizacao.data);
    }
    if (dadosAtualizacao.categoriaId !== undefined) {
      transacao.categoria = dadosAtualizacao.categoriaId
        ? ({ id: dadosAtualizacao.categoriaId } as Categoria)
        : undefined;
    }

    // Salva e retorna com relacionamentos
    await this.repositorioTransacao.save(transacao);

    return (await this.repositorioTransacao.findOne({
      where: { id: transacaoId },
      relations: ["categoria"],
    })) as Transacao;
  }

  /**
   * Remove uma transação
   *
   * @param transacaoId - ID da transação
   * @param usuarioId - ID do usuário
   * @returns Promise void
   */
  async removerTransacao(
    transacaoId: string,
    usuarioId: string
  ): Promise<void> {
    const transacao = await this.buscarTransacaoPorId(transacaoId, usuarioId);

    if (!transacao) {
      throw new Error("Transação não encontrada");
    }

    await this.repositorioTransacao.remove(transacao);
  }

  /**
   * Gera resumo mensal das transações
   *
   * @param usuarioId - ID do usuário
   * @param ano - Ano do resumo
   * @param mes - Mês do resumo (1-12)
   * @returns Promise com resumo mensal detalhado
   */
  async obterResumoMensal(
    usuarioId: string,
    ano: number,
    mes: number
  ): Promise<ResumoMensalDto> {
    // Calcula período do mês
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    // Busca transações do período
    const transacoes = await this.repositorioTransacao.find({
      where: {
        usuario: { id: usuarioId },
        data: Between(dataInicio, dataFim),
      },
      relations: ["categoria"],
    });

    return this.calcularResumoMensal(transacoes, ano, mes);
  }

  /**
   * Obtém estatísticas financeiras do usuário por período
   *
   * @param usuarioId - ID do usuário
   * @param dataInicio - Data inicial
   * @param dataFim - Data final
   * @returns Promise com estatísticas do período
   */
  async obterEstatisticasPeriodo(
    usuarioId: string,
    dataInicio: Date,
    dataFim: Date
  ): Promise<{
    totalTransacoes: number;
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
    mediaReceitasPorDia: number;
    mediaDespesasPorDia: number;
    maiorReceita: number;
    maiorDespesa: number;
    diasComTransacoes: number;
    categoriaMaisUsada: string | null;
  }> {
    const transacoes = await this.repositorioTransacao.find({
      where: {
        usuario: { id: usuarioId },
        data: Between(dataInicio, dataFim),
      },
      relations: ["categoria"],
    });

    const receitas = transacoes.filter((t) => t.tipo === "receita");
    const despesas = transacoes.filter((t) => t.tipo === "despesa");

    const totalReceitas = receitas.reduce((total, t) => total + t.valor, 0);
    const totalDespesas = despesas.reduce((total, t) => total + t.valor, 0);

    // Calcula dias no período
    const diasNoPeriodo =
      Math.ceil(
        (dataFim.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    // Calcula dias únicos com transações
    const diasComTransacoes = new Set(
      transacoes.map((t) => t.data.toDateString())
    ).size;

    // Encontra maior receita e despesa
    const maiorReceita =
      receitas.length > 0 ? Math.max(...receitas.map((t) => t.valor)) : 0;
    const maiorDespesa =
      despesas.length > 0 ? Math.max(...despesas.map((t) => t.valor)) : 0;

    // Encontra categoria mais usada
    const contagemCategorias = transacoes.reduce((acc, t) => {
      const categoria = t.categoria?.nome || "Sem categoria";
      acc[categoria] = (acc[categoria] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const categoriaMaisUsada =
      Object.keys(contagemCategorias).length > 0
        ? Object.keys(contagemCategorias).reduce((a, b) =>
            contagemCategorias[a] > contagemCategorias[b] ? a : b
          )
        : null;

    return {
      totalTransacoes: transacoes.length,
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      mediaReceitasPorDia:
        diasNoPeriodo > 0
          ? Math.round((totalReceitas / diasNoPeriodo) * 100) / 100
          : 0,
      mediaDespesasPorDia:
        diasNoPeriodo > 0
          ? Math.round((totalDespesas / diasNoPeriodo) * 100) / 100
          : 0,
      maiorReceita,
      maiorDespesa,
      diasComTransacoes,
      categoriaMaisUsada,
    };
  }

  /**
   * Lista transações recentes do usuário
   *
   * @param usuarioId - ID do usuário
   * @param limite - Número de transações a retornar
   * @returns Promise com transações recentes
   */
  async listarTransacoesRecentes(
    usuarioId: string,
    limite: number = 5
  ): Promise<Transacao[]> {
    return await this.repositorioTransacao.find({
      where: { usuario: { id: usuarioId } },
      relations: ["categoria"],
      order: { data: "DESC", criadoEm: "DESC" },
      take: limite,
    });
  }

  /**
   * Duplica uma transação existente
   *
   * @param transacaoId - ID da transação a duplicar
   * @param usuarioId - ID do usuário
   * @param novaData - Nova data para a transação duplicada
   * @returns Promise com a transação duplicada
   */
  async duplicarTransacao(
    transacaoId: string,
    usuarioId: string,
    novaData?: Date
  ): Promise<Transacao> {
    const transacaoOriginal = await this.buscarTransacaoPorId(
      transacaoId,
      usuarioId
    );

    if (!transacaoOriginal) {
      throw new Error("Transação não encontrada");
    }

    const dadosTransacao: CriarTransacaoDto = {
      titulo: `${transacaoOriginal.titulo} (Cópia)`,
      descricao: transacaoOriginal.descricao,
      valor: transacaoOriginal.valor,
      tipo: transacaoOriginal.tipo,
      data: (novaData || new Date()).toISOString().split("T")[0],
      categoriaId: transacaoOriginal.categoria?.id,
    };

    return await this.criarTransacao(dadosTransacao, usuarioId);
  }

  // === MÉTODOS PRIVADOS ===

  /**
   * Valida se a categoria existe e pertence ao usuário
   *
   * @param categoriaId - ID da categoria
   * @param usuarioId - ID do usuário
   * @throws Error se categoria não encontrada
   */
  private async validarCategoria(
    categoriaId: string,
    usuarioId: string
  ): Promise<void> {
    const categoria = await this.repositorioCategoria.findOne({
      where: {
        id: categoriaId,
        usuario: { id: usuarioId },
      },
    });

    if (!categoria) {
      throw new Error("Categoria não encontrada");
    }
  }

  /**
   * Calcula resumo de um array de transações
   *
   * @param transacoes - Array de transações
   * @returns Resumo com totais
   */
  private calcularResumoTransacoes(transacoes: Transacao[]): {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  } {
    const totalReceitas = transacoes
      .filter((t) => t.tipo === "receita")
      .reduce((total, t) => total + t.valor, 0);

    const totalDespesas = transacoes
      .filter((t) => t.tipo === "despesa")
      .reduce((total, t) => total + t.valor, 0);

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
    };
  }

  /**
   * Calcula resumo mensal detalhado
   *
   * @param transacoes - Transações do mês
   * @param ano - Ano do resumo
   * @param mes - Mês do resumo
   * @returns Resumo mensal completo
   */
  private calcularResumoMensal(
    transacoes: Transacao[],
    ano: number,
    mes: number
  ): ResumoMensalDto {
    const receitas = transacoes.filter((t) => t.tipo === "receita");
    const despesas = transacoes.filter((t) => t.tipo === "despesa");

    const totalReceitas = receitas.reduce((total, t) => total + t.valor, 0);
    const totalDespesas = despesas.reduce((total, t) => total + t.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    // Resumo por categoria
    const resumoPorCategoria = transacoes.reduce((acc, transacao) => {
      const categoriaId = transacao.categoria?.id || "sem-categoria";
      const categoriaNome = transacao.categoria?.nome || "Sem categoria";

      if (!acc[categoriaId]) {
        acc[categoriaId] = {
          categoria: {
            id: categoriaId,
            nome: categoriaNome,
          },
          totalReceitas: 0,
          totalDespesas: 0,
          quantidadeTransacoes: 0,
        };
      }

      if (transacao.tipo === "receita") {
        acc[categoriaId].totalReceitas += transacao.valor;
      } else {
        acc[categoriaId].totalDespesas += transacao.valor;
      }

      acc[categoriaId].quantidadeTransacoes++;

      return acc;
    }, {} as any);

    return {
      periodo: {
        ano,
        mes,
      },
      totalReceitas,
      totalDespesas,
      saldo,
      quantidadeTransacoes: transacoes.length,
      receitasPorCategoria: {},
      despesasPorCategoria: {},
      transacoesMaiores: [],
    };
  }
}

/**
 * Instância única do serviço de transações
 *
 * Utilizamos o padrão Singleton para garantir que apenas
 * uma instância do serviço seja criada e reutilizada
 * em toda a aplicação.
 */
export const servicoTransacoes = new ServicoTransacoes();
