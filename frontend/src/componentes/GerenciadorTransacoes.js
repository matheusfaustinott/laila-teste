import {
  Add,
  ArrowBack,
  FilterList,
  Search,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Fab,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { categorias } from "../estado/categorias";
import { irParaDashboard } from "../estado/navegacao";
import {
  abrirFormularioTransacao,
  estatisticasTransacoes,
  filtrosCategoria,
  filtrosTipo,
  limparFiltros,
  termoBusca,
  transacoes,
} from "../estado/transacoes";
import { categoriasAPI, transacoesAPI } from "../servicos/api";
import strings from "../strings";
import { formatarMoeda } from "../utils/formatadores";
import FormularioTransacao from "./FormularioTransacao";
import ListaTransacoes from "./ListaTransacoes";

const GerenciadorTransacoes = () => {
  useSignals();
  useEffect(() => {
    carregarTransacoes();
    carregarCategorias();
  }, []);

  const carregarTransacoes = () => {
    transacoesAPI.listar(
      {},
      (dados) => {
        const transacoesProcessadas = (dados.transacoes || []).map(
          (transacao) => ({
            ...transacao,
            valor: parseFloat(transacao.valor || 0),
          })
        );
        transacoes.value = transacoesProcessadas;
      },
      (erro) => {
        console.error("Erro ao carregar transações:", erro);
      }
    );
  };

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

  const handleFiltroTipo = (event) => {
    filtrosTipo.value = event.target.value;
  };

  const handleFiltroCategoria = (event) => {
    filtrosCategoria.value = event.target.value || null;
  };

  const handleBusca = (event) => {
    termoBusca.value = event.target.value;
  };

  const stats = estatisticasTransacoes.value;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(208, 148, 234) 0%, rgb(188, 128, 214) 100%)",
        padding: 2,
      }}
    >
      <Box sx={{ maxWidth: 1200, margin: "0 auto" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            marginBottom: 3,
            gap: 2,
          }}
        >
          <IconButton
            onClick={irParaDashboard}
            sx={{ color: "white" }}
            title={strings.transacoes.voltarDashboard}
          >
            <ArrowBack />
          </IconButton>
          <Typography
            variant="h4"
            color="white"
            fontWeight="bold"
            sx={{ flex: 1 }}
          >
            {strings.transacoes.transacoes}
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => abrirFormularioTransacao()}
            sx={{
              color: "white",
              borderColor: "white",
              display: { xs: "none", md: "flex" },
            }}
          >
            {strings.transacoes.adicionarTransacao}
          </Button>
        </Box>
        <Card sx={{ marginBottom: 3 }}>
          <CardContent sx={{ padding: 3 }}>
            <Grid container spacing={3} sx={{ marginBottom: 3 }}>
              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <TrendingUp color="success" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {strings.transacoes.totalIncome}
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatarMoeda(stats.totalReceitas)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <TrendingDown color="error" />
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {strings.transacoes.totalExpense}
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatarMoeda(stats.totalDespesas)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="h5"
                        color={stats.saldo >= 0 ? "success.main" : "error.main"}
                      >
                        =
                      </Typography>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {strings.transacoes.balance}
                        </Typography>
                        <Typography
                          variant="h6"
                          color={
                            stats.saldo >= 0 ? "success.main" : "error.main"
                          }
                        >
                          {formatarMoeda(stats.saldo)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={3}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography variant="h5" color="primary">
                        #
                      </Typography>
                      <Box>
                        <Typography variant="caption" color="textSecondary">
                          {strings.transacoes.totalTransacoes}
                        </Typography>
                        <Typography variant="h6">
                          {stats.quantidadeTotal}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Card variant="outlined" sx={{ marginBottom: 3 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <FilterList color="action" />
                  <Typography variant="h6">
                    {strings.transacoes.filtros}
                  </Typography>

                  <TextField
                    size="small"
                    placeholder={strings.transacoes.buscarTitulo}
                    value={termoBusca.value}
                    onChange={handleBusca}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ minWidth: 200 }}
                  />

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{strings.transacoes.tipoLabel}</InputLabel>
                    <Select
                      value={filtrosTipo.value}
                      onChange={handleFiltroTipo}
                      label="Tipo"
                    >
                      <MenuItem value="TODOS">
                        {strings.transacoes.todos}
                      </MenuItem>
                      <MenuItem value="receita">
                        {strings.transacoes.receitas}
                      </MenuItem>
                      <MenuItem value="despesa">
                        {strings.transacoes.despesas}
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>{strings.transacoes.categoriaLabel}</InputLabel>
                    <Select
                      value={filtrosCategoria.value || ""}
                      onChange={handleFiltroCategoria}
                      label={strings.transacoes.categoriaLabel}
                    >
                      <MenuItem value="">{strings.transacoes.todas}</MenuItem>
                      {categorias.value.map((categoria) => (
                        <MenuItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={limparFiltros}
                    sx={{ marginLeft: "auto" }}
                  >
                    {strings.transacoes.limparFiltros}
                  </Button>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    marginTop: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {filtrosTipo.value !== "TODOS" && (
                    <Chip
                      label={`${strings.transacoes.filtroTipo}: ${
                        filtrosTipo.value === "receita"
                          ? strings.transacoes.receita
                          : strings.transacoes.despesa
                      }`}
                      onDelete={() => (filtrosTipo.value = "TODOS")}
                      color="primary"
                      size="small"
                    />
                  )}
                  {filtrosCategoria.value && (
                    <Chip
                      label={`${strings.transacoes.filtroCategoria}: ${
                        categorias.value.find(
                          (c) => c.id === filtrosCategoria.value
                        )?.nome || ""
                      }`}
                      onDelete={() => (filtrosCategoria.value = null)}
                      color="primary"
                      size="small"
                    />
                  )}
                  {termoBusca.value && (
                    <Chip
                      label={`${strings.transacoes.filtroBusca}: "${termoBusca.value}"`}
                      onDelete={() => (termoBusca.value = "")}
                      color="primary"
                      size="small"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
            <ListaTransacoes onAtualizar={carregarTransacoes} />
          </CardContent>
        </Card>
        <FormularioTransacao onSucesso={carregarTransacoes} />
        <Fab
          color="primary"
          aria-label="adicionar transação"
          sx={{
            position: "fixed",
            bottom: 20,
            right: 20,
            display: { xs: "flex", md: "none" },
          }}
          onClick={() => abrirFormularioTransacao()}
        >
          <Add />
        </Fab>
      </Box>
    </Box>
  );
};

export default GerenciadorTransacoes;
