import { Response } from "express";
import { Repository } from "typeorm";
import { AppDataSource } from "../database/db";
import { Categoria } from "../modelos/categoria";
import { CriarCategoriaDto, RequestAutenticado } from "../tipos";
import {
  respostaConflito,
  respostaCriado,
  respostaDadosInvalidos,
  respostaErro,
  respostaNaoAutorizado,
  respostaNaoEncontrado,
  respostaSemConteudo,
  respostaSucesso,
} from "../utils/respostas";

/**
 * Controlador de Categorias
 *
 * Este controlador gerencia todas as operações CRUD relacionadas
 * às categorias de transações financeiras.
 *
 * Princípios aplicados:
 * - Single Responsibility: apenas operações de categoria
 * - Data Ownership: usuário só acessa suas próprias categorias
 * - Input Validation: validação rigorosa dos dados
 * - Error Handling: tratamento consistente de erros
 *
 * Endpoints disponíveis:
 * - GET /categorias - Lista categorias do usuário
 * - GET /categorias/:id - Busca categoria específica
 * - POST /categorias - Cria nova categoria
 * - PUT /categorias/:id - Atualiza categoria
 * - DELETE /categorias/:id - Remove categoria
 */

// Repository para operações com banco de dados
let repositorioCategoria: Repository<Categoria>;

// Inicializa o repositório quando o DataSource estiver pronto
const inicializarRepositorio = () => {
  if (!repositorioCategoria) {
    repositorioCategoria = AppDataSource.getRepository(Categoria);
  }
};

/**
 * Lista todas as categorias do usuário autenticado
 *
 * @param req - Request autenticado
 * @param res - Response com lista de categorias
 *
 * Query parameters opcionais:
 * - limite: número máximo de resultados
 * - pagina: página atual (para paginação)
 * - busca: termo para busca por nome
 */
export const listarCategorias = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Parâmetros de paginação e busca
    const limite = parseInt(req.query.limite as string) || 10;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const busca = req.query.busca as string;

    // Validação dos parâmetros
    if (limite < 1 || limite > 100) {
      respostaDadosInvalidos(res, "Limite deve estar entre 1 e 100");
      return;
    }

    if (pagina < 1) {
      respostaDadosInvalidos(res, "Página deve ser maior que 0");
      return;
    }

    // Monta query base
    const queryBuilder = repositorioCategoria
      .createQueryBuilder("categoria")
      .where("categoria.usuarioId = :usuarioId", { usuarioId: req.usuario.id })
      .orderBy("categoria.nome", "ASC");

    // Adiciona filtro de busca se fornecido
    if (busca && busca.trim()) {
      queryBuilder.andWhere("categoria.nome ILIKE :busca", {
        busca: `%${busca.trim()}%`,
      });
    }

    // Aplica paginação
    const offset = (pagina - 1) * limite;
    queryBuilder.skip(offset).take(limite);

    // Executa query
    const [categorias, total] = await queryBuilder.getManyAndCount();

    // Calcula metadados de paginação
    const totalPaginas = Math.ceil(total / limite);
    const temProximaPagina = pagina < totalPaginas;
    const temPaginaAnterior = pagina > 1;

    respostaSucesso(res, {
      categorias,
      paginacao: {
        paginaAtual: pagina,
        totalPaginas,
        totalRegistros: total,
        registrosPorPagina: limite,
        temProximaPagina,
        temPaginaAnterior,
      },
      filtros: busca ? { busca } : {},
    });
  } catch (error) {
    console.error("Erro ao listar categorias:", error);
    respostaErro(res, "Erro interno do servidor ao listar categorias");
  }
};

/**
 * Busca uma categoria específica por ID
 *
 * @param req - Request com ID da categoria
 * @param res - Response com dados da categoria
 */
export const buscarCategoriaPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca a categoria garantindo que pertence ao usuário
    const categoria = await repositorioCategoria.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
      relations: ["usuario"],
    });

    if (!categoria) {
      respostaNaoEncontrado(res, "Categoria não encontrada");
      return;
    }

    respostaSucesso(res, {
      categoria,
      mensagem: "Categoria encontrada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao buscar categoria:", error);
    respostaErro(res, "Erro interno do servidor ao buscar categoria");
  }
};

/**
 * Cria uma nova categoria
 *
 * @param req - Request com dados da categoria
 * @param res - Response com categoria criada
 */
export const criarCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const { nome, descricao }: CriarCategoriaDto = req.body;

    // Validação dos dados
    const errosValidacao = validarDadosCategoria({ nome, descricao });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }

    // Verifica se já existe categoria com mesmo nome para o usuário
    const categoriaExistente = await repositorioCategoria.findOne({
      where: {
        nome: nome.trim(),
        usuario: { id: req.usuario.id },
      },
    });

    if (categoriaExistente) {
      respostaConflito(
        res,
        "Categoria",
        "Já existe uma categoria com este nome para este usuário"
      );
      return;
    }

    // Cria nova categoria
    const novaCategoria = repositorioCategoria.create({
      nome: nome.trim(),
      descricao: descricao?.trim(),
      usuario: { id: req.usuario.id },
    });

    // Salva no banco
    const categoriaSalva = await repositorioCategoria.save(novaCategoria);

    respostaCriado(
      res,
      {
        categoria: categoriaSalva,
        mensagem: "Categoria criada com sucesso",
      },
      "Categoria criada com sucesso"
    );
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    respostaErro(res, "Erro interno do servidor ao criar categoria");
  }
};

/**
 * Atualiza uma categoria existente
 *
 * @param req - Request com ID e novos dados da categoria
 * @param res - Response com categoria atualizada
 */
export const atualizarCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const { nome, descricao } = req.body;

    // Validação dos dados
    const errosValidacao = validarDadosCategoria({ nome, descricao });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }

    // Busca a categoria garantindo que pertence ao usuário
    const categoria = await repositorioCategoria.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
    });

    if (!categoria) {
      respostaNaoEncontrado(res, "Categoria não encontrada");
      return;
    }

    // Verifica se não há conflito de nome (exceto com ela mesma)
    if (nome && nome.trim() !== categoria.nome) {
      const categoriaComMesmoNome = await repositorioCategoria.findOne({
        where: {
          nome: nome.trim(),
          usuario: { id: req.usuario.id },
        },
      });

      if (categoriaComMesmoNome) {
        respostaConflito(
          res,
          "Categoria",
          "Já existe uma categoria com este nome"
        );
        return;
      }
    }

    // Atualiza os dados
    if (nome) categoria.nome = nome.trim();
    if (descricao !== undefined) categoria.descricao = descricao?.trim();

    // Salva as alterações
    const categoriaAtualizada = await repositorioCategoria.save(categoria);

    respostaSucesso(res, {
      categoria: categoriaAtualizada,
      mensagem: "Categoria atualizada com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    respostaErro(res, "Erro interno do servidor ao atualizar categoria");
  }
};

/**
 * Remove uma categoria
 *
 * @param req - Request com ID da categoria
 * @param res - Response confirmando remoção
 */
export const removerCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    const { id } = req.params;

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Busca a categoria garantindo que pertence ao usuário
    const categoria = await repositorioCategoria.findOne({
      where: {
        id,
        usuario: { id: req.usuario.id },
      },
      relations: ["transacoes"],
    });

    if (!categoria) {
      respostaNaoEncontrado(res, "Categoria não encontrada");
      return;
    }

    // Verifica se a categoria tem transações associadas
    if (categoria.transacoes && categoria.transacoes.length > 0) {
      respostaDadosInvalidos(
        res,
        "Não é possível remover categoria que possui transações associadas"
      );
      return;
    }

    // Remove a categoria
    await repositorioCategoria.remove(categoria);

    respostaSemConteudo(res);
  } catch (error) {
    console.error("Erro ao remover categoria:", error);
    respostaErro(res, "Erro interno do servidor ao remover categoria");
  }
};

/**
 * Lista as categorias mais usadas pelo usuário
 *
 * @param req - Request autenticado
 * @param res - Response com categorias e contadores
 */
export const listarCategoriasMaisUsadas = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    // Verifica se o usuário está autenticado
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    // Query para buscar categorias com contagem de transações
    const categorias = await repositorioCategoria
      .createQueryBuilder("categoria")
      .leftJoin("categoria.transacoes", "transacao")
      .where("categoria.usuarioId = :usuarioId", { usuarioId: req.usuario.id })
      .select([
        "categoria.id",
        "categoria.nome",
        "categoria.descricao",
        "COUNT(transacao.id) as totalTransacoes",
      ])
      .groupBy("categoria.id, categoria.nome, categoria.descricao")
      .orderBy("COUNT(transacao.id)", "DESC")
      .limit(10)
      .getRawMany();

    respostaSucesso(res, {
      categorias: categorias.map((cat) => ({
        id: cat.categoria_id,
        nome: cat.categoria_nome,
        descricao: cat.categoria_descricao,
        totalTransacoes: parseInt(cat.totalTransacoes) || 0,
      })),
      mensagem: "Categorias mais usadas recuperadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao listar categorias mais usadas:", error);
    respostaErro(
      res,
      "Erro interno do servidor ao listar categorias mais usadas"
    );
  }
};

// === FUNÇÕES AUXILIARES ===

/**
 * Valida os dados de uma categoria
 *
 * @param dados - Dados da categoria para validar
 * @returns Array de erros encontrados
 */
const validarDadosCategoria = (dados: CriarCategoriaDto): string[] => {
  const erros: string[] = [];

  // Validação do nome
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push("Nome da categoria deve ter pelo menos 2 caracteres");
  }

  if (dados.nome && dados.nome.trim().length > 50) {
    erros.push("Nome da categoria deve ter no máximo 50 caracteres");
  }

  // Validação da descrição (opcional)
  if (dados.descricao && dados.descricao.trim().length > 200) {
    erros.push("Descrição deve ter no máximo 200 caracteres");
  }

  return erros;
};
