import { Between, Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Categoria } from "../modelos/categoria";
import { Transacao } from "../modelos/transacao";
import { CriarTransacaoDto, ResumoMensalDto } from "../tipos";

class ServicoTransacoes {
  private repositorioTransacao: Repository<Transacao>;
  private repositorioCategoria: Repository<Categoria>;

  constructor() {
    this.repositorioTransacao = AppDataSource.getRepository(Transacao);
    this.repositorioCategoria = AppDataSource.getRepository(Categoria);
  }

  /**
   * @param usuarioId
   * @param filtros
   * @returns
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
    const queryBuilder = this.repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .where("transacao.usuarioId = :usuarioId", { usuarioId });

    // filtros
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
    // order
    const campoOrdenacao =
      ordenacao === "data"
        ? "transacao.data"
        : ordenacao === "valor"
        ? "transacao.valor"
        : "transacao.titulo";

    queryBuilder.orderBy(campoOrdenacao, direcaoOrdenacao);

    // order default
    if (ordenacao !== "data") {
      queryBuilder.addOrderBy("transacao.data", "DESC");
    }
    const transacoesTodas = await queryBuilder.getMany();
    const total = transacoesTodas.length;

    const resumo = this.calcularResumoTransacoes(transacoesTodas);
    const offset = (pagina - 1) * limite;
    const transacoes = await queryBuilder.skip(offset).take(limite).getMany();
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
   * @param transacaoId
   * @param usuarioId
   * @returns
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
   * @param dadosTransacao
   * @param usuarioId
   * @returns
   */
  async criarTransacao(
    dadosTransacao: CriarTransacaoDto,
    usuarioId: string
  ): Promise<Transacao> {
    const { titulo, descricao, valor, tipo, data, categoriaId } =
      dadosTransacao;
    if (categoriaId) {
      await this.validarCategoria(categoriaId, usuarioId);
    }
    let categoriaFinal: Categoria;
    if (categoriaId) {
      const categoria = await this.repositorioCategoria.findOne({
        where: {
          id: categoriaId,
          usuario: { id: usuarioId },
        },
      });
      if (!categoria) {
        throw new Error("Categoria não encontrada");
      }
      categoriaFinal = categoria;
    } else {
      const categoriaOutras = await this.repositorioCategoria.findOne({
        where: {
          nome: "Outras",
          usuario: { id: usuarioId },
        },
      });
      if (!categoriaOutras) {
        throw new Error("Categoria padrão 'Outras' não encontrada");
      }
      categoriaFinal = categoriaOutras;
    }

    const novaTransacao = this.repositorioTransacao.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim(),
      valor: parseFloat(valor.toString()),
      tipo: tipo.toLowerCase() as "receita" | "despesa",
      data: new Date(data),
      usuario: { id: usuarioId },
      categoria: categoriaFinal,
    });
    const transacaoSalva = await this.repositorioTransacao.save(novaTransacao);

    return (await this.repositorioTransacao.findOne({
      where: { id: transacaoSalva.id },
      relations: ["categoria"],
    })) as Transacao;
  }

  /**
   * @param transacaoId
   * @param dadosAtualizacao
   * @param usuarioId
   * @returns
   */
  async atualizarTransacao(
    transacaoId: string,
    dadosAtualizacao: Partial<CriarTransacaoDto>,
    usuarioId: string
  ): Promise<Transacao> {
    const transacao = await this.buscarTransacaoPorId(transacaoId, usuarioId);

    if (!transacao) {
      throw new Error("Transação não encontrada");
    }
    if (
      dadosAtualizacao.categoriaId !== undefined &&
      dadosAtualizacao.categoriaId !== null
    ) {
      await this.validarCategoria(dadosAtualizacao.categoriaId, usuarioId);
    }
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
      if (dadosAtualizacao.categoriaId) {
        transacao.categoria = { id: dadosAtualizacao.categoriaId } as Categoria;
      } else {
        const categoriaOutras = await this.repositorioCategoria.findOne({
          where: {
            nome: "Outras",
            usuario: { id: usuarioId },
          },
        });
        if (!categoriaOutras) {
          throw new Error("Categoria padrão 'Outras' não encontrada");
        }
        transacao.categoria = categoriaOutras;
      }
    }
    await this.repositorioTransacao.save(transacao);

    return (await this.repositorioTransacao.findOne({
      where: { id: transacaoId },
      relations: ["categoria"],
    })) as Transacao;
  }

  /**
   * @param transacaoId
   * @param usuarioId
   * @returns
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
   * @param usuarioId
   * @param ano
   * @param mes
   * @returns
   */
  async obterResumoMensal(
    usuarioId: string,
    ano: number,
    mes: number
  ): Promise<ResumoMensalDto> {
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);
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
   * @param categoriaId
   * @param usuarioId
   * @throws
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
   * @param transacoes
   * @returns
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
   * @param transacoes
   * @param ano
   * @param mes
   * @returns
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
export const servicoTransacoes = new ServicoTransacoes();
