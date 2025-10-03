import {
  ArrowBack,
  Assessment,
  TrendingDown,
  TrendingUp,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { useSignal, useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { irParaDashboard } from "../estado/navegacao";
import { transacoesAPI } from "../servicos/api";
import strings from "../strings";
import {
  formatarData,
  formatarMes,
  formatarMoeda,
} from "../utils/formatadores";

const ResumoMensal = () => {
  useSignals();
  const resumo = useSignal(null);
  const carregando = useSignal(false);
  const ano = useSignal(new Date().getFullYear());
  const mes = useSignal(new Date().getMonth() + 1);

  useEffect(() => {
    obterResumoMensal();
  }, [ano.value, mes.value]);

  const obterResumoMensal = async () => {
    carregando.value = true;

    const callbackSucesso = (dados) => {
      console.log("Dados recebidos no callback:", dados);
      resumo.value = dados;
      console.log("Resumo signal após atualização:", resumo.value);
      carregando.value = false;
    };

    const callbackErro = (erro) => {
      console.error(strings.resumo.erroObterResumo, erro);
      carregando.value = false;
    };

    transacoesAPI.resumoMensal(
      ano.value,
      mes.value,
      callbackSucesso,
      callbackErro
    );
  };

  const gerarOpcoesAno = () => {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anos.push(i);
    }
    return anos;
  };

  const gerarOpcoesMes = () => {
    return strings.resumo.arrayMeses.map((nome, index) => ({
      valor: index + 1,
      nome,
    }));
  };

  const obterCorSaldo = (saldo) => {
    if (saldo > 0) return "success.main";
    if (saldo < 0) return "error.main";
    return "text.primary";
  };

  const obterTextoSaldo = (saldo) => {
    if (saldo > 0) return strings.resumo.saldoPositivo;
    if (saldo < 0) return strings.resumo.saldoNegativo;
    return strings.resumo.saldoNeutro;
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
        <Assessment color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {strings.geral.resumoMensal}
        </Typography>
      </Box>
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {strings.resumo.periodo}
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{strings.resumo.mes}</InputLabel>
                <Select
                  value={mes.value}
                  label={strings.resumo.mes}
                  onChange={(e) => (mes.value = e.target.value)}
                >
                  {gerarOpcoesMes().map((item) => (
                    <MenuItem key={item.valor} value={item.valor}>
                      {item.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>{strings.resumo.ano}</InputLabel>
                <Select
                  value={ano.value}
                  label={strings.resumo.ano}
                  onChange={(e) => (ano.value = e.target.value)}
                >
                  {gerarOpcoesAno().map((anoOpcao) => (
                    <MenuItem key={anoOpcao} value={anoOpcao}>
                      {anoOpcao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                variant="outlined"
                onClick={obterResumoMensal}
                disabled={carregando.value}
                fullWidth
              >
                {carregando.value
                  ? strings.resumo.carregando
                  : strings.resumo.atualizar}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {resumo.value ? (
        <>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ textAlign: "center", mb: 3 }}
          >
            {resumo.value?.periodo?.mes && resumo.value?.periodo?.ano
              ? `${strings.resumo.resumoDe} ${formatarMes(
                  resumo.value.periodo.mes
                )} ${resumo.value.periodo.ano}`
              : strings.resumo.resumoDe + " período selecionado"}
          </Typography>
          <Grid container spacing={2} sx={{ marginBottom: 3 }}>
            <Grid item xs={4} sm={4} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    <TrendingUp
                      sx={{
                        color: "success.main",
                        fontSize: { xs: 24, sm: 40 },
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        color="success.main"
                        sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
                      >
                        {strings.resumo.receitas}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "0.9rem", sm: "1.5rem" } }}
                      >
                        {formatarMoeda(resumo.value.totalReceitas || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    <TrendingDown
                      sx={{ color: "error.main", fontSize: { xs: 24, sm: 40 } }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        color="error.main"
                        sx={{ fontSize: { xs: "0.75rem", sm: "1rem" } }}
                      >
                        {strings.resumo.despesas}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "0.9rem", sm: "1.5rem" } }}
                      >
                        {formatarMoeda(resumo.value.totalDespesas || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={4} md={4}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ padding: { xs: 1, sm: 2 } }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    <Assessment
                      sx={{
                        color: obterCorSaldo(resumo.value.saldo || 0),
                        fontSize: { xs: 24, sm: 40 },
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: obterCorSaldo(resumo.value.saldo || 0),
                          fontSize: { xs: "0.75rem", sm: "1rem" },
                        }}
                      >
                        {obterTextoSaldo(resumo.value.saldo || 0)}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          color: obterCorSaldo(resumo.value.saldo || 0),
                          fontSize: { xs: "0.9rem", sm: "1.5rem" },
                        }}
                      >
                        {formatarMoeda(resumo.value.saldo || 0)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {strings.resumo.estatisticasPeriodo}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>{strings.resumo.totalTransacoes}:</strong>{" "}
                    {resumo.value.quantidadeTransacoes || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>{strings.resumo.periodo}:</strong>{" "}
                    {resumo.value?.periodo?.mes && resumo.value?.periodo?.ano
                      ? `${formatarMes(resumo.value.periodo.mes)} de ${
                          resumo.value.periodo.ano
                        }`
                      : strings.resumo.nenhumDadoEncontrado}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                {strings.resumo.receitasPorCategoria}
              </Typography>
              <List>
                {Object.entries(resumo.value.receitasPorCategoria || {}).map(
                  ([categoria, valor]) => (
                    <ListItem key={categoria} divider>
                      <ListItemText
                        primary={categoria}
                        secondary={formatarMoeda(valor)}
                      />
                    </ListItem>
                  )
                )}
              </List>
            </CardContent>
          </Card>
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error.main">
                {strings.resumo.despesasPorCategoria}
              </Typography>
              <List>
                {Object.entries(resumo.value.despesasPorCategoria || {}).map(
                  ([categoria, valor]) => (
                    <ListItem key={categoria} divider>
                      <ListItemText
                        primary={categoria}
                        secondary={formatarMoeda(valor)}
                      />
                    </ListItem>
                  )
                )}
              </List>
            </CardContent>
          </Card>
          {resumo.value.transacoesMaiores &&
            resumo.value.transacoesMaiores.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {strings.resumo.principaisTransacoes}
                  </Typography>
                  <List>
                    {resumo.value.transacoesMaiores.map((transacao) => (
                      <ListItem key={transacao.id} divider>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <Typography component="span">
                                {transacao.titulo}
                              </Typography>
                              <Typography
                                component="span"
                                color={
                                  transacao.tipo === "receita"
                                    ? "success.main"
                                    : "error.main"
                                }
                                sx={{ fontWeight: "bold" }}
                              >
                                {transacao.tipo === "receita" ? "+" : "-"}
                                {formatarMoeda(Math.abs(transacao.valor))}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                              }}
                            >
                              <Typography variant="body2" color="textSecondary">
                                {transacao.categoria ||
                                  strings.resumo.semCategoria}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {formatarData(transacao.data)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
        </>
      ) : carregando.value ? (
        <Box sx={{ textAlign: "center", padding: 4 }}>
          <Typography variant="h6">
            {strings.resumo.carregandoResumo}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", padding: 4 }}>
          <Assessment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {strings.resumo.nenhumDadoEncontrado}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {strings.resumo.nenhumaTransacaoPeriodo}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ResumoMensal;
