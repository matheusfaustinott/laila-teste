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
import { useEffect } from "react";
import {
    abrirConfirmacaoRemocao,
    categoriaAtual,
    categoriaParaRemover,
    categorias,
    descricaoFormulario,
    fecharConfirmacaoRemocao,
    modoEdicaoCategoria,
    mostrandoConfirmacaoRemocao,
    mostrandoFormularioCategoria,
    nomeFormulario,
    preencherFormularioCategoria,
    resetarFormularioCategoria,
    selecionarCategoria,
} from "../estado/categorias";
import { irParaDashboard } from "../estado/navegacao";
import { categoriasAPI } from "../servicos/api";
import strings from "../strings";
import { formatarData } from "../utils/formatadores";

const GerenciadorCategorias = () => {
  useSignals();
  useEffect(() => {
    carregarCategorias();
  }, []);

  useEffect(() => {
    if (categoriaAtual.value) {
      preencherFormularioCategoria(categoriaAtual.value);
    } else {
      nomeFormulario.value = "";
      descricaoFormulario.value = "";
    }
  }, [categoriaAtual.value]);

  const carregarCategorias = () => {
    categoriasAPI.listar(
      {}, // ta pasando vazio
      (dados) => {
        categorias.value = dados.categorias || [];
      },
      (erro) => {
        console.error("Erro ao carregar categorias:", erro);
      }
    );
  };

  const abrirFormularioNovo = () => { // utilizar bath
    resetarFormularioCategoria();
    modoEdicaoCategoria.value = false;
    mostrandoFormularioCategoria.value = true;
  };

  const abrirFormularioEdicao = (categoria) => {
    selecionarCategoria(categoria);
    preencherFormularioCategoria(categoria);
    modoEdicaoCategoria.value = true;
    mostrandoFormularioCategoria.value = true;
  };

  const fecharFormulario = () => {
    mostrandoFormularioCategoria.value = false;
    resetarFormularioCategoria();
  };

  const salvarCategoria = () => {
    if (!nomeFormulario.value.trim()) {
      return;
    }

    const dados = {
      nome: nomeFormulario.value.trim(),
      descricao: descricaoFormulario.value.trim() || null,
    };

    if (modoEdicaoCategoria.value && categoriaAtual.value) {
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
    abrirConfirmacaoRemocao(categoria);
  };

  const removerCategoria = () => {
    if (categoriaParaRemover.value) {
      categoriasAPI.remover(
        categoriaParaRemover.value.id,
        () => {
          carregarCategorias();
          fecharConfirmacaoRemocao();
        },
        (erro) => {
          console.error("Erro ao remover categoria:", erro);
          fecharConfirmacaoRemocao();
        }
      );
    }
  };

  return (
    <Box sx={{ padding: 3, maxWidth: 1200, margin: "0 auto" }}>
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
      <Typography variant="body1" color="textSecondary" paragraph>
        {strings.categorias.descricao}
      </Typography>
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
              value={nomeFormulario.value}
              onChange={(e) => (nomeFormulario.value = e.target.value)}
              required
              fullWidth
              variant="outlined"
            />
            <TextField
              label={strings.categorias.descricaoCampo}
              value={descricaoFormulario.value}
              onChange={(e) => (descricaoFormulario.value = e.target.value)}
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
            disabled={!nomeFormulario.value.trim()}
          >
            {modoEdicaoCategoria.value
              ? strings.geral.atualizar
              : strings.geral.salvar}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={mostrandoConfirmacaoRemocao.value}
        onClose={fecharConfirmacaoRemocao}
      >
        <DialogTitle>{strings.categorias.confirmarRemocao}</DialogTitle>
        <DialogContent>
          <Typography>
            {strings.categorias.confirmarRemocaoTexto}{" "}
            <strong>{categoriaParaRemover.value?.nome}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharConfirmacaoRemocao} color="inherit">
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
