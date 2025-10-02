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

/**
 * Controlador de Transações
 *
 * Este controlador gerencia todas as operações CRUD relacionadas
 * às transações financeiras do usuário.
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas operações de transação
 * - Data Ownership: usuário só acessa suas próprias transações
 * - Business Logic: cálculos de resumos e estatísticas
 * - Input Validation: validação rigorosa dos dados financeiros
 *
 * Endpoints disponíveis:
 * - GET /transacoes - Lista transações do usuário
 * - GET /transacoes/:id - Busca transação específica
 * - POST /transacoes - Cria nova transação
 * - PUT /transacoes/:id - Atualiza transação
 * - DELETE /transacoes/:id - Remove transação
 * - GET /transacoes/resumo-mensal - Estatísticas mensais
 */

// Repositories para operações com banco de dados
let repositorioTransacao: Repository<Transacao>;
let repositorioCategoria: Repository<Categoria>;

// Inicializa os repositórios quando o DataSource estiver pronto
const inicializarRepositorios = () => {
  if (!repositorioTransacao) {
    repositorioTransacao = AppDataSource.getRepository(Transacao);
  }
  if (!repositorioCategoria) {
    repositorioCategoria = AppDataSource.getRepository(Categoria);
  }
};

/**
 * Lista todas as transações do usuário autenticado
 *
 * @param req - Request autenticado
 * @param res - Response com lista de transações
 *
 * Query parameters opcionais:
 * - limite: número máximo de resultados
 * - pagina: página atual (para paginação)
 * - tipo: filtro por tipo (receita/despesa)
 * - categoriaId: filtro por categoria
 * - dataInicio/dataFim: filtro por período
 */
export const listarTransacoes = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Parâmetros de consulta
    const limite = parseInt(req.query.limite as string) || 10;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const tipo = req.query.tipo as string;
    const categoriaId = req.query.categoriaId as string;
    const dataInicio = req.query.dataInicio as string;
    const dataFim = req.query.dataFim as string;

    // Validação dos parâmetros
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

    // Monta query base
    const queryBuilder = repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .where("transacao.usuarioId = :usuarioId", { usuarioId: req.usuario.id })
      .orderBy("transacao.data", "DESC");

    // Adiciona filtros opcionais
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

    // Aplica paginação
    const offset = (pagina - 1) * limite;
    queryBuilder.skip(offset).take(limite);

    // Executa query
    const [transacoes, total] = await queryBuilder.getManyAndCount();

    // Calcula metadados de paginação
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
 * Busca uma transação específica por ID
 *
 * @param req - Request com ID da transação
 * @param res - Response com dados da transação
 */
export const buscarTransacaoPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca a transação garantindo que pertence ao usuário
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
 * Cria uma nova transação
 *
 * @param req - Request com dados da transação
 * @param res - Response com transação criada
 */
export const criarTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    // Verifica se o usuário está autenticado
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

    // Validação dos dados
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

    // Verifica se a categoria existe e pertence ao usuário (se fornecida)
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

    // Cria nova transação
    const novaTransacao = repositorioTransacao.create({
      titulo: titulo.trim(),
      descricao: descricao?.trim(),
      valor: parseFloat(valor.toString()),
      tipo: tipo.toLowerCase() as "receita" | "despesa",
      data: new Date(data),
      usuario: { id: req.usuario.id },
      categoria: categoriaId ? { id: categoriaId } : undefined,
    });

    // Salva no banco
    const transacaoSalva = await repositorioTransacao.save(novaTransacao);

    // Busca a transação completa com relacionamentos
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
    console.error("Erro detalhado ao criar transação:");
    console.error("Stack trace:", (error as Error).stack);
    console.error("Message:", (error as Error).message);
    console.error("Name:", (error as Error).name);
    console.error("Full error:", error);
    respostaErro(res, "Erro interno do servidor ao criar transação");
  }
};

/**
 * Atualiza uma transação existente
 *
 * @param req - Request com ID e novos dados da transação
 * @param res - Response com transação atualizada
 */
export const atualizarTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const { titulo, descricao, valor, tipo, data, categoriaId } = req.body;

    // Validação dos dados
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

    // Busca a transação garantindo que pertence ao usuário
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

    // Verifica se a categoria existe e pertence ao usuário (se fornecida)
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

    // Atualiza os dados
    transacao.titulo = titulo.trim();
    transacao.descricao = descricao?.trim();
    transacao.valor = parseFloat(valor.toString());
    transacao.tipo = tipo.toLowerCase() as "receita" | "despesa";
    transacao.data = new Date(data);
    transacao.categoria = categoriaId
      ? ({ id: categoriaId } as Categoria)
      : undefined;

    // Salva as alterações
    const transacaoAtualizada = await repositorioTransacao.save(transacao);

    // Busca a transação completa com relacionamentos
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
 * Remove uma transação
 *
 * @param req - Request com ID da transação
 * @param res - Response confirmando remoção
 */
export const removerTransacao = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca a transação garantindo que pertence ao usuário
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

    // Remove a transação
    await repositorioTransacao.remove(transacao);

    respostaSemConteudo(res);
  } catch (error) {
    console.error("Erro ao remover transação:", error);
    respostaErro(res, "Erro interno do servidor ao remover transação");
  }
};

/**
 * Obtém resumo financeiro mensal do usuário
 *
 * @param req - Request com ano e mês opcionais
 * @param res - Response com estatísticas financeiras
 */
export const obterResumoMensal = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorios();

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Parâmetros de consulta (padrão: mês atual)
    const ano = parseInt(req.query.ano as string) || new Date().getFullYear();
    const mes = parseInt(req.query.mes as string) || new Date().getMonth() + 1;

    // Validação dos parâmetros
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

    // Datas de início e fim do mês no formato YYYY-MM-DD
    const dataInicioStr = `${ano}-${mes.toString().padStart(2, "0")}-01`;
    const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
    const dataFimStr = `${ano}-${mes
      .toString()
      .padStart(2, "0")}-${ultimoDiaDoMes.toString().padStart(2, "0")}`;

    // Busca transações do período usando createQueryBuilder
    const transacoes = await repositorioTransacao
      .createQueryBuilder("transacao")
      .leftJoinAndSelect("transacao.categoria", "categoria")
      .leftJoinAndSelect("transacao.usuario", "usuario")
      .where("usuario.id = :usuarioId", { usuarioId: req.usuario.id })
      .andWhere("transacao.data >= :dataInicio", { dataInicio: dataInicioStr })
      .andWhere("transacao.data <= :dataFim", { dataFim: dataFimStr })
      .getMany();

    // Calcula estatísticas
    let totalReceitas = 0;
    let totalDespesas = 0;
    const receitasPorCategoria: { [key: string]: number } = {};
    const despesasPorCategoria: { [key: string]: number } = {};

    transacoes.forEach((transacao) => {
      if (transacao.tipo === "receita") {
        totalReceitas += transacao.valor;
        const categoria = transacao.categoria?.nome || "Sem categoria";
        receitasPorCategoria[categoria] =
          (receitasPorCategoria[categoria] || 0) + transacao.valor;
      } else {
        totalDespesas += transacao.valor;
        const categoria = transacao.categoria?.nome || "Sem categoria";
        despesasPorCategoria[categoria] =
          (despesasPorCategoria[categoria] || 0) + transacao.valor;
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
        .sort((a, b) => b.valor - a.valor)
        .slice(0, 5)
        .map((t) => ({
          id: t.id,
          titulo: t.titulo,
          valor: t.valor,
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

// === FUNÇÕES AUXILIARES ===

/**
 * Valida os dados de uma transação
 *
 * @param dados - Dados da transação para validar
 * @returns Array de erros encontrados
 */
const validarDadosTransacao = (dados: CriarTransacaoDto): string[] => {
  const erros: string[] = [];

  // Validação do título
  if (!dados.titulo || dados.titulo.trim().length < 3) {
    erros.push("Título deve ter pelo menos 3 caracteres");
  }

  if (dados.titulo && dados.titulo.trim().length > 100) {
    erros.push("Título deve ter no máximo 100 caracteres");
  }

  // Validação da descrição (opcional)
  if (dados.descricao && dados.descricao.trim().length > 500) {
    erros.push("Descrição deve ter no máximo 500 caracteres");
  }

  // Validação do valor
  const valor = parseFloat(dados.valor.toString());
  if (isNaN(valor) || valor <= 0) {
    erros.push("Valor deve ser um número positivo");
  }

  if (valor > 999999.99) {
    erros.push("Valor deve ser menor que R$ 999.999,99");
  }

  // Validação do tipo
  if (
    !dados.tipo ||
    !["RECEITA", "DESPESA", "receita", "despesa"].includes(dados.tipo)
  ) {
    erros.push('Tipo deve ser "RECEITA" ou "DESPESA"');
  }

  // Validação da data
  if (!dados.data) {
    erros.push("Data é obrigatória");
  } else {
    const data = new Date(dados.data);
    if (isNaN(data.getTime())) {
      erros.push("Data deve estar em formato válido");
    }

    // Não permite datas futuras além de 1 ano
    const umAnoNoFuturo = new Date();
    umAnoNoFuturo.setFullYear(umAnoNoFuturo.getFullYear() + 1);

    if (data > umAnoNoFuturo) {
      erros.push("Data não pode ser superior a 1 ano no futuro");
    }

    // Não permite datas muito antigas
    const anoMinimo = new Date("1900-01-01");
    if (data < anoMinimo) {
      erros.push("Data não pode ser anterior a 1900");
    }
  }

  return erros;
};
