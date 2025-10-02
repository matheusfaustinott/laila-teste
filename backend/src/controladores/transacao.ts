import { Response } from "express";
import { Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Categoria } from "../modelos/categoria";
import { Transacao } from "../modelos/transacao";
import {
  CriarTransacaoDto,
  RequestAutenticado,
  ResumoMensalDto,
} from "../tipos";
import {
  respostaCriado,
  respostaDadosInvalidos,
  respostaErro,
  respostaNaoAutorizado,
  respostaNaoEncontrado,
  respostaSemConteudo,
  respostaSucesso,
} from "../utils/respostas";

let repositorioTransacao: Repository<Transacao>;
let repositorioCategoria: Repository<Categoria>;

const inicializarRepositorios = () => {
  if (!repositorioTransacao) {
    repositorioTransacao = AppDataSource.getRepository(Transacao);
  }
  if (!repositorioCategoria) {
    repositorioCategoria = AppDataSource.getRepository(Categoria);
  }
};

/**
 * @param req - Request autenticado
 * @param res - Response com lista de transações
 */
export const listarTransacoes = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    const limite = parseInt(req.query.limite as string) || 10;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const tipo = req.query.tipo as string;
    const categoriaId = req.query.categoriaId as string;
    const dataInicio = req.query.dataInicio as string;
    const dataFim = req.query.dataFim as string;
    if (limite < 1 || limite > 100) {
      respostaDadosInvalidos(res, "Limite deve estar entre 1 e 100");
      return;
    }

    if (pagina < 1) {
      respostaDadosInvalidos(res, "Página deve ser maior que 0");
      return;
    }

    if (tipo && !["receita", "despesa"].includes(tipo)) {
      respostaDadosInvalidos(res, 'Tipo deve ser "receita" ou "despesa"');
      return;
    }
    const queryBuilder = repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .where("transacao.usuarioId = :usuarioId", { usuarioId: req.usuario.id })
      .orderBy("transacao.data", "DESC");

    if (tipo) {
      queryBuilder.andWhere("transacao.tipo = :tipo", { tipo });
    }

    if (categoriaId) {
      queryBuilder.andWhere("transacao.categoriaId = :categoriaId", {
        categoriaId,
      });
    }

    if (dataInicio) {
      queryBuilder.andWhere("transacao.data >= :dataInicio", { dataInicio });
    }

    if (dataFim) {
      queryBuilder.andWhere("transacao.data <= :dataFim", { dataFim });
    }
    const offset = (pagina - 1) * limite;
    queryBuilder.skip(offset).take(limite);
    const [transacoes, total] = await queryBuilder.getManyAndCount();
    const totalPaginas = Math.ceil(total / limite);

    respostaSucesso(res, {
      transacoes,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: total,
        registrosPorPagina: limite,
      },
      filtros: {
        ...(tipo && { tipo }),
        ...(categoriaId && { categoriaId }),
        ...(dataInicio && { dataInicio }),
        ...(dataFim && { dataFim }),
      },
    });
  } catch (error) {
    console.error("Erro ao listar transações:", error);
    respostaErro(res, "Erro interno do servidor ao listar transações");
  }
};

/**
 *
 * @param req
 * @param res
 */
export const buscarTransacaoPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;

    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const transacao = await repositorioTransacao.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
      relations: ["categoria", "usuario"],
    });

    if (!transacao) {
      respostaNaoEncontrado(res, "Transação não encontrada");
      return;
    }

    respostaSucesso(res, {
      transacao,
      mensagem: "Transação encontrada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar transação:", error);
    respostaErro(res, "Erro interno do servidor ao buscar transação");
  }
};

/**
 * @param req
 * @param res
 */
export const criarTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const {
      titulo,
      descricao,
      valor,
      tipo,
      data,
      categoriaId,
    }: CriarTransacaoDto = req.body;
    const errosValidacao = validarDadosTransacao({
      titulo,
      descricao,
      valor,
      tipo,
      data,
      categoriaId,
    });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
    if (categoriaId) {
      const categoria = await repositorioCategoria.findOne({
        where: {
          id: categoriaId,
          usuario: { id: req.usuario.id },
        },
      });

      if (!categoria) {
        respostaNaoEncontrado(res, "Categoria não encontrada");
        return;
      }
    }
    const novaTransacao = repositorioTransacao.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim(),
      valor: parseFloat(valor.toString()),
      tipo: tipo.toLowerCase() as "receita" | "despesa",
      data: new Date(data),
      usuario: { id: req.usuario.id },
      categoria: categoriaId ? { id: categoriaId } : undefined,
    });
    const transacaoSalva = await repositorioTransacao.save(novaTransacao);
    const transacaoCompleta = await repositorioTransacao.findOne({
      where: { id: transacaoSalva.id },
      relations: ["categoria"],
    });

    respostaCriado(
      res,
      {
        transacao: transacaoCompleta,
        mensagem: "Transação criada com sucesso",
      },
      "Transação criada com sucesso"
    );
  } catch (error) {
    respostaErro(res, "Erro interno do servidor ao criar transação");
  }
};

/**
 * @param req
 * @param res
 */
export const atualizarTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const { titulo, descricao, valor, tipo, data, categoriaId } = req.body;
    const errosValidacao = validarDadosTransacao({
      titulo,
      descricao,
      valor,
      tipo,
      data,
      categoriaId,
    });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
    const transacao = await repositorioTransacao.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
    });

    if (!transacao) {
      respostaNaoEncontrado(res, "Transação não encontrada");
      return;
    }
    if (categoriaId) {
      const categoria = await repositorioCategoria.findOne({
        where: {
          id: categoriaId,
          usuario: { id: req.usuario.id },
        },
      });

      if (!categoria) {
        respostaNaoEncontrado(res, "Categoria não encontrada");
        return;
      }
    }
    transacao.titulo = titulo.trim();
    transacao.descricao = descricao?.trim();
    transacao.valor = parseFloat(valor.toString());
    transacao.tipo = tipo.toLowerCase() as "receita" | "despesa";
    transacao.data = new Date(data);
    transacao.categoria = categoriaId
      ? ({ id: categoriaId } as Categoria)
      : undefined;
    const transacaoAtualizada = await repositorioTransacao.save(transacao);
    const transacaoCompleta = await repositorioTransacao.findOne({
      where: { id: transacaoAtualizada.id },
      relations: ["categoria"],
    });

    respostaSucesso(res, {
      transacao: transacaoCompleta,
      mensagem: "Transação atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar transação:", error);
    respostaErro(res, "Erro interno do servidor ao atualizar transação");
  }
};

/**
 *
 * @param req
 * @param res
 */
export const removerTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    const transacao = await repositorioTransacao.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
    });

    if (!transacao) {
      respostaNaoEncontrado(res, "Transação não encontrada");
      return;
    }
    await repositorioTransacao.remove(transacao);

    respostaSemConteudo(res);
  } catch (error) {
    console.error("Erro ao remover transação:", error);
    respostaErro(res, "Erro interno do servidor ao remover transação");
  }
};

/**
 * @param req
 * @param res
 */
export const obterResumoMensal = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;
    if (ano < 1900 || ano > new Date().getFullYear() + 10) {
      respostaDadosInvalidos(
        res,
        "Ano deve estar entre 1900 e " + (new Date().getFullYear() + 10)
      );
      return;
    }

    if (mes < 1 || mes > 12) {
      respostaDadosInvalidos(res, "Mês deve estar entre 1 e 12");
      return;
    }
    const dataInicioStr = `${ano}-${mes.toString().padStart(2, "0")}-01`;
    const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
    const dataFimStr = `${ano}-${mes
      .toString()
      .padStart(2, "0")}-${ultimoDiaDoMes.toString().padStart(2, "0")}`;
    const transacoes = await repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .leftJoinAndSelect("transacao.usuario", "usuario")
      .where("usuario.id = :usuarioId", { usuarioId: req.usuario.id })
      .andWhere("transacao.data >= :dataInicio", { dataInicio: dataInicioStr })
      .andWhere("transacao.data <= :dataFim", { dataFim: dataFimStr })
      .getMany();

    // começar a calcular estatísticas
    let totalReceitas = 0;
    let totalDespesas = 0;
    const receitasPorCategoria: { [key: string]: number } = {};
    const despesasPorCategoria: { [key: string]: number } = {};

    transacoes.forEach((transacao) => {
      const valor = parseFloat(transacao.valor.toString());

      if (transacao.tipo === "receita") {
        totalReceitas += valor;
        const categoria = transacao.categoria?.nome || "Sem categoria";
        receitasPorCategoria[categoria] =
          (receitasPorCategoria[categoria] || 0) + valor;
      } else {
        totalDespesas += valor;
        const categoria = transacao.categoria?.nome || "Sem categoria";
        despesasPorCategoria[categoria] =
          (despesasPorCategoria[categoria] || 0) + valor;
      }
    });

    const saldo = totalReceitas - totalDespesas;

    const resumo: ResumoMensalDto = {
      periodo: { ano, mes },
      totalReceitas,
      totalDespesas,
      saldo,
      quantidadeTransacoes: transacoes.length,
      receitasPorCategoria,
      despesasPorCategoria,
      transacoesMaiores: transacoes
        .sort(
          (a, b) =>
            parseFloat(b.valor.toString()) - parseFloat(a.valor.toString())
        )
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          titulo: t.titulo,
          valor: parseFloat(t.valor.toString()),
          tipo: t.tipo,
          data: t.data,
          categoria: t.categoria?.nome || null,
        })),
    };

    respostaSucesso(res, {
      resumo,
      mensagem: `Resumo financeiro de ${mes}/${ano} gerado com sucesso`,
    });
  } catch (error) {
    console.error("Erro ao obter resumo mensal:", error);
    respostaErro(res, "Erro interno do servidor ao obter resumo mensal");
  }
};

/**
 * @param dados
 * @returns
 */
const validarDadosTransacao = (dados: CriarTransacaoDto): string[] => {
  const erros: string[] = [];
  if (!dados.titulo || dados.titulo.trim().length < 3) {
    erros.push("Título deve ter pelo menos 3 caracteres");
  }

  if (dados.titulo && dados.titulo.trim().length > 100) {
    erros.push("Título deve ter no máximo 100 caracteres");
  }
  if (dados.descricao && dados.descricao.trim().length > 500) {
    erros.push("Descrição deve ter no máximo 500 caracteres");
  }
  const valor = parseFloat(dados.valor.toString());
  if (isNaN(valor) || valor <= 0) {
    erros.push("Valor deve ser um número positivo");
  }

  if (valor > 999999.99) {
    erros.push("Valor deve ser menor que R$ 999.999,99");
  }
  if (
    !dados.tipo ||
    !["RECEITA", "DESPESA", "receita", "despesa"].includes(dados.tipo) // botei em uper e lower pra ter certeza que vai funcionar
  ) {
    erros.push('Tipo deve ser "RECEITA" ou "DESPESA"');
  }
  if (!dados.data) {
    erros.push("Data é obrigatória");
  } else {
    const data = new Date(dados.data);
    if (isNaN(data.getTime())) {
      erros.push("Data deve estar em formato válido");
    }
    const umAnoNoFuturo = new Date();
    umAnoNoFuturo.setFullYear(umAnoNoFuturo.getFullYear() + 1);
    if (data > umAnoNoFuturo) {
      erros.push("Data não pode ser superior a 1 ano no futuro");
    }
    const anoMinimo = new Date("1900-01-01");
    if (data < anoMinimo) {
      erros.push("Data não pode ser anterior a 1900");
    }
  }
  return erros;
};
