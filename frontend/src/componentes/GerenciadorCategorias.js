import { Add, ArrowBack, Category, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect, useState } from "react";
import {
  categoriaAtual,
  categorias,
  modoEdicaoCategoria,
  mostrandoFormularioCategoria,
  resetarFormularioCategoria,
  selecionarCategoria,
} from "../estado/categorias";
import { irParaDashboard } from "../estado/navegacao";
import { categoriasAPI } from "../servicos/api";
import strings from "../strings";

const GerenciadorCategorias = () => {
  useSignals();

  // Estados locais do formulário
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [mostrandoConfirmacao, setMostrandoConfirmacao] = useState(false);
  const [categoriaParaRemover, setCategoriaParaRemover] = useState(null);

  // Carrega categorias ao montar o componente
  useEffect(() => {
    carregarCategorias();
  }, []);

  // Atualiza formulário quando categoria atual muda
  useEffect(() => {
    if (categoriaAtual.value) {
      setNome(categoriaAtual.value.nome || "");
      setDescricao(categoriaAtual.value.descricao || "");
    } else {
      setNome("");
      setDescricao("");
    }
  }, [categoriaAtual.value]);

  const carregarCategorias = () => {
    categoriasAPI.listar(
      {},
      (dados) => {
        categorias.value = dados.categorias || [];
      },
      (erro) => {
        console.error("Erro ao carregar categorias:", erro);
      }
    );
  };

  const abrirFormularioNovo = () => {
    resetarFormularioCategoria();
    setNome("");
    setDescricao("");
    modoEdicaoCategoria.value = false;
    mostrandoFormularioCategoria.value = true;
  };

  const abrirFormularioEdicao = (categoria) => {
    selecionarCategoria(categoria);
    setNome(categoria.nome);
    setDescricao(categoria.descricao || "");
    modoEdicaoCategoria.value = true;
    mostrandoFormularioCategoria.value = true;
  };

  const fecharFormulario = () => {
    mostrandoFormularioCategoria.value = false;
    resetarFormularioCategoria();
    setNome("");
    setDescricao("");
  };

  const salvarCategoria = () => {
    if (!nome.trim()) {
      return;
    }

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim() || undefined,
    };

    if (modoEdicaoCategoria.value && categoriaAtual.value) {
      // Editar categoria existente
      categoriasAPI.atualizar(
        categoriaAtual.value.id,
        dados,
        () => {
          carregarCategorias();
          fecharFormulario();
        },
        (erro) => {
          console.error("Erro ao atualizar categoria:", erro);
        }
      );
    } else {
      // Criar nova categoria
      categoriasAPI.criar(
        dados,
        () => {
          carregarCategorias();
          fecharFormulario();
        },
        (erro) => {
          console.error("Erro ao criar categoria:", erro);
        }
      );
    }
  };

  const confirmarRemocao = (categoria) => {
    setCategoriaParaRemover(categoria);
    setMostrandoConfirmacao(true);
  };

  const removerCategoria = () => {
    if (categoriaParaRemover) {
      categoriasAPI.remover(
        categoriaParaRemover.id,
        () => {
          carregarCategorias();
          setMostrandoConfirmacao(false);
          setCategoriaParaRemover(null);
        },
        (erro) => {
          console.error("Erro ao remover categoria:", erro);
          setMostrandoConfirmacao(false);
          setCategoriaParaRemover(null);
        }
      );
    }
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString("pt-BR");
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: "0 auto" }}>
      {/* Cabeçalho */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginBottom: 3,
        }}
      >
        <IconButton onClick={irParaDashboard} color="primary">
          <ArrowBack />
        </IconButton>
        <Category color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {strings.categorias.titulo}
        </Typography>
      </Box>

      {/* Descrição */}
      <Typography variant="body1" color="textSecondary" paragraph>
        {strings.categorias.descricao}
      </Typography>

      {/* Lista de categorias */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {strings.categorias.listagemTitulo}
          </Typography>

          {categorias.value.length === 0 ? (
            <Box sx={{ textAlign: "center", padding: 4 }}>
              <Category sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="textSecondary" gutterBottom>
                {strings.categorias.nenhumaCategoria}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {strings.categorias.crieAPriveira}
              </Typography>
            </Box>
          ) : (
            <List>
              {categorias.value.map((categoria, index) => (
                <ListItem
                  key={categoria.id}
                  divider={index < categorias.value.length - 1}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle1" component="span">
                          {categoria.nome}
                        </Typography>
                        <Chip
                          label={formatarData(categoria.criadoEm)}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={categoria.descricao || "Sem descrição"}
                  />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => abrirFormularioEdicao(categoria)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => confirmarRemocao(categoria)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Botão flutuante para adicionar */}
      <Fab
        color="primary"
        aria-label="adicionar categoria"
        onClick={abrirFormularioNovo}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        <Add />
      </Fab>

      {/* Modal do formulário */}
      <Dialog
        open={mostrandoFormularioCategoria.value}
        onClose={fecharFormulario}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {modoEdicaoCategoria.value
            ? strings.categorias.editarCategoria
            : strings.categorias.novaCategoria}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label={strings.categorias.nomeCampo}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              label={strings.categorias.descricaoCampo}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              placeholder={strings.categorias.descricaoPlaceholder}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharFormulario} color="inherit">
            {strings.geral.cancelar}
          </Button>
          <Button
            onClick={salvarCategoria}
            variant="contained"
            disabled={!nome.trim()}
          >
            {modoEdicaoCategoria.value
              ? strings.geral.atualizar
              : strings.geral.salvar}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmação de remoção */}
      <Dialog
        open={mostrandoConfirmacao}
        onClose={() => setMostrandoConfirmacao(false)}
      >
        <DialogTitle>{strings.categorias.confirmarRemocao}</DialogTitle>
        <DialogContent>
          <Typography>
            {strings.categorias.confirmarRemocaoTexto}{" "}
            <strong>{categoriaParaRemover?.nome}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setMostrandoConfirmacao(false)}
            color="inherit"
          >
            {strings.geral.cancelar}
          </Button>
          <Button onClick={removerCategoria} color="error" variant="contained">
            {strings.categorias.remover}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GerenciadorCategorias;
