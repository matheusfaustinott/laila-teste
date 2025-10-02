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

let repositorioCategoria: Repository<Categoria>;
const inicializarRepositorio = () => {
  if (!repositorioCategoria) {
    repositorioCategoria = AppDataSource.getRepository(Categoria);
  }
};

/**
 *
 * @param req
 * @param res
 */
export const listarCategorias = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    const limite = parseInt(req.query.limite as string) || 10;
    const pagina = parseInt(req.query.pagina as string) || 1;
    const busca = req.query.busca as string;
    if (limite < 1 || limite > 100) {
      respostaDadosInvalidos(res, "Limite deve estar entre 1 e 100");
      return;
    }
    if (pagina < 1) {
      respostaDadosInvalidos(res, "Página deve ser maior que 0");
      return;
    }
    // Monta query
    const queryBuilder = repositorioCategoria
      .createQueryBuilder("categoria")
      .where("categoria.usuarioId = :usuarioId", { usuarioId: req.usuario.id })
      .orderBy("categoria.nome", "ASC");

    if (busca && busca.trim()) {
      queryBuilder.andWhere("categoria.nome ILIKE :busca", {
        busca: `%${busca.trim()}%`,
      });
    }
    const offset = (pagina - 1) * limite;
    queryBuilder.skip(offset).take(limite);
    const [categorias, total] = await queryBuilder.getManyAndCount();
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
 * @param req
 * @param res
 */
export const buscarCategoriaPorId = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();
    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
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
 *
 * @param req
 * @param res
 */
export const criarCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
    const { nome, descricao }: CriarCategoriaDto = req.body;
    const errosValidacao = validarDadosCategoria({ nome, descricao });
    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
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
    const novaCategoria = repositorioCategoria.create({
      nome: nome.trim(),
      descricao: descricao?.trim(),
      usuario: { id: req.usuario.id },
    });
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
 *
 * @param req
 * @param res
 */
export const atualizarCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }

    const { nome, descricao } = req.body;
    const errosValidacao = validarDadosCategoria({ nome, descricao });

    if (errosValidacao.length > 0) {
      respostaDadosInvalidos(res, errosValidacao);
      return;
    }
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
    if (nome) categoria.nome = nome.trim();
    if (descricao !== undefined) categoria.descricao = descricao?.trim();
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
 *
 * @param req
 * @param res
 */
export const removerCategoria = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();

    const { id } = req.params;
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
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
    if (categoria.transacoes && categoria.transacoes.length > 0) {
      respostaDadosInvalidos(
        res,
        "Não é possível remover categoria que possui transações associadas"
      );
      return;
    }
    await repositorioCategoria.remove(categoria);

    respostaSemConteudo(res);
  } catch (error) {
    console.error("Erro ao remover categoria:", error);
    respostaErro(res, "Erro interno do servidor ao remover categoria");
  }
};

/**
 *
 * @param req
 * @param res
 */
export const listarCategoriasMaisUsadas = async (
  req: RequestAutenticado,
  res: Response
): Promise<void> => {
  try {
    inicializarRepositorio();
    if (!req.usuario) {
      respostaNaoAutorizado(res, "Usuário não autenticado");
      return;
    }
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

/**
 * @param dados
 * @returns
 */
const validarDadosCategoria = (dados: CriarCategoriaDto): string[] => {
  const erros: string[] = [];
  if (!dados.nome || dados.nome.trim().length < 2) {
    erros.push("Nome da categoria deve ter pelo menos 2 caracteres");
  }

  if (dados.nome && dados.nome.trim().length > 50) {
    erros.push("Nome da categoria deve ter no máximo 50 caracteres");
  }
  if (dados.descricao && dados.descricao.trim().length > 200) {
    erros.push("Descrição deve ter no máximo 200 caracteres");
  }

  return erros;
};
