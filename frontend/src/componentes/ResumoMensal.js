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
import { formatarMoeda } from "../utils/formatadores";

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
      resumo.value = dados;
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

  const formatarMes = (mes) => {
    return strings.resumo.arrayMeses[mes - 1];
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
                disabled={carregando}
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
            {strings.resumo.resumoDe} {formatarMes(resumo.value.periodo.mes)}{" "}
            {resumo.value.periodo.ano}
          </Typography>
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TrendingUp sx={{ color: "success.main", fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" color="success.main">
                        {strings.resumo.receitas}
                      </Typography>
                      <Typography variant="h4">
                        {formatarMoeda(resumo.value.totalReceitas)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TrendingDown sx={{ color: "error.main", fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" color="error.main">
                        {strings.resumo.despesas}
                      </Typography>
                      <Typography variant="h4">
                        {formatarMoeda(resumo.value.totalDespesas)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Assessment
                      sx={{
                        color: obterCorSaldo(resumo.value.saldo),
                        fontSize: 40,
                      }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: obterCorSaldo(resumo.value.saldo) }}
                      >
                        {obterTextoSaldo(resumo.value.saldo)}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: obterCorSaldo(resumo.value.saldo) }}
                      >
                        {formatarMoeda(resumo.value.saldo)}
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
                    {resumo.value.quantidadeTransacoes}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>{strings.resumo.periodo}:</strong>{" "}
                    {formatarMes(resumo.value.periodo.mes)} de{" "}
                    {resumo.value.periodo.ano}
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
                {Object.entries(resumo.value.receitasPorCategoria).map(
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
                {Object.entries(resumo.value.despesasPorCategoria).map(
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
                                {new Date(transacao.data).toLocaleDateString(
                                  "pt-BR"
                                )}
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
      ) : carregando ? (
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
