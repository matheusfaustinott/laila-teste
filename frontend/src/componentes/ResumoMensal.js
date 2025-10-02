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
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect, useState } from "react";
import { irParaDashboard } from "../estado/navegacao";
import { transacoesAPI } from "../servicos/api";
import strings from "../strings";

const ResumoMensal = () => {
  useSignals();

  // Estados locais
  const [resumo, setResumo] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mes, setMes] = useState(new Date().getMonth() + 1);

  // Carrega resumo ao montar e quando filtros mudam
  useEffect(() => {
    carregarResumo();
  }, [ano, mes]);

  const carregarResumo = () => {
    setCarregando(true);
    transacoesAPI.resumoMensal(
      ano,
      mes,
      (dados) => {
        setResumo(dados.resumo);
        setCarregando(false);
      },
      (erro) => {
        console.error("Erro ao carregar resumo:", erro);
        setCarregando(false);
      }
    );
  };

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarMes = (mes) => {
    const meses = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];
    return meses[mes - 1];
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
    return [
      { valor: 1, nome: "Janeiro" },
      { valor: 2, nome: "Fevereiro" },
      { valor: 3, nome: "Março" },
      { valor: 4, nome: "Abril" },
      { valor: 5, nome: "Maio" },
      { valor: 6, nome: "Junho" },
      { valor: 7, nome: "Julho" },
      { valor: 8, nome: "Agosto" },
      { valor: 9, nome: "Setembro" },
      { valor: 10, nome: "Outubro" },
      { valor: 11, nome: "Novembro" },
      { valor: 12, nome: "Dezembro" },
    ];
  };

  const obterCorSaldo = (saldo) => {
    if (saldo > 0) return "success.main";
    if (saldo < 0) return "error.main";
    return "text.primary";
  };

  const obterTextoSaldo = (saldo) => {
    if (saldo > 0) return "Saldo Positivo";
    if (saldo < 0) return "Saldo Negativo";
    return "Saldo Neutro";
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
        <Assessment color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {strings.geral.resumoMensal}
        </Typography>
      </Box>

      {/* Filtros */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Período
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Mês</InputLabel>
                <Select
                  value={mes}
                  label="Mês"
                  onChange={(e) => setMes(e.target.value)}
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
                <InputLabel>Ano</InputLabel>
                <Select
                  value={ano}
                  label="Ano"
                  onChange={(e) => setAno(e.target.value)}
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
                onClick={carregarResumo}
                disabled={carregando}
                fullWidth
              >
                {carregando ? "Carregando..." : "Atualizar"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {resumo ? (
        <>
          {/* Título do período */}
          <Typography
            variant="h5"
            gutterBottom
            sx={{ textAlign: "center", mb: 3 }}
          >
            Resumo de {formatarMes(resumo.periodo.mes)} {resumo.periodo.ano}
          </Typography>

          {/* Cards principais */}
          <Grid container spacing={3} sx={{ marginBottom: 3 }}>
            {/* Total de Receitas */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TrendingUp sx={{ color: "success.main", fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" color="success.main">
                        Receitas
                      </Typography>
                      <Typography variant="h4">
                        {formatarMoeda(resumo.totalReceitas)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Total de Despesas */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TrendingDown sx={{ color: "error.main", fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" color="error.main">
                        Despesas
                      </Typography>
                      <Typography variant="h4">
                        {formatarMoeda(resumo.totalDespesas)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Saldo */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Assessment
                      sx={{ color: obterCorSaldo(resumo.saldo), fontSize: 40 }}
                    />
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ color: obterCorSaldo(resumo.saldo) }}
                      >
                        {obterTextoSaldo(resumo.saldo)}
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: obterCorSaldo(resumo.saldo) }}
                      >
                        {formatarMoeda(resumo.saldo)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Estatísticas adicionais */}
          <Card sx={{ marginBottom: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estatísticas do Período
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Total de Transações:</strong>{" "}
                    {resumo.quantidadeTransacoes}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Período:</strong> {formatarMes(resumo.periodo.mes)}{" "}
                    de {resumo.periodo.ano}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Receitas por categoria */}
          {Object.keys(resumo.receitasPorCategoria).length > 0 && (
            <Card sx={{ marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  Receitas por Categoria
                </Typography>
                <List>
                  {Object.entries(resumo.receitasPorCategoria).map(
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
          )}

          {/* Despesas por categoria */}
          {Object.keys(resumo.despesasPorCategoria).length > 0 && (
            <Card sx={{ marginBottom: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error.main">
                  Despesas por Categoria
                </Typography>
                <List>
                  {Object.entries(resumo.despesasPorCategoria).map(
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
          )}

          {/* Transações maiores */}
          {resumo.transacoesMaiores && resumo.transacoesMaiores.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Principais Transações
                </Typography>
                <List>
                  {resumo.transacoesMaiores.map((transacao) => (
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
                              {transacao.categoria || "Sem categoria"}
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
          <Typography variant="h6">Carregando resumo...</Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", padding: 4 }}>
          <Assessment sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Nenhum dado encontrado
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Não há transações para o período selecionado.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ResumoMensal;
