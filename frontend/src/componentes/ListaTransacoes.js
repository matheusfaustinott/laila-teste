import { Delete, Edit, TrendingDown, TrendingUp } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { mostrarModalConfirmacao } from "../estado/modais";
import {
  abrirFormularioTransacao,
  transacoesFiltradas,
} from "../estado/transacoes";
import { transacoesAPI } from "../servicos/api";
import strings from "../strings";
import { formatarData, formatarMoeda } from "../utils/formatadores";

const ListaTransacoes = ({ onAtualizar }) => {
  useSignals();

  const handleEditar = (transacao) => {
    abrirFormularioTransacao(transacao);
  };

  const handleExcluir = (transacao) => {
    mostrarModalConfirmacao(
      strings.geral.confirmarExclusao,
      `${strings.transacoes.confirmarExclusaoTransacao} "${transacao.titulo}"?`,
      () => {
        const callbackSucesso = () => {
          if (onAtualizar) {
            onAtualizar();
          }
        };

        transacoesAPI.excluir(transacao.id, callbackSucesso);
      },
      null,
      {
        textoConfirmar: strings.geral.excluir,
        textoCancelar: strings.geral.cancelar,
        tipoConfirmar: "error",
      }
    );
  };

  const getCorTipo = (tipo) => {
    return tipo?.toUpperCase() === "RECEITA" ? "success" : "error";
  };

  const getIconeTipo = (tipo) => {
    return tipo?.toUpperCase() === "RECEITA" ? (
      <TrendingUp />
    ) : (
      <TrendingDown />
    );
  };

  const isReceita = (tipo) => tipo?.toUpperCase() === "RECEITA";

  if (!transacoesFiltradas.value || transacoesFiltradas.value.length === 0) {
    return (
      <Card sx={{ width: "100%" }}>
        <CardContent sx={{ textAlign: "center", padding: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {strings.transacoes.nenhumaTransacaoEncontrada}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {transacoesFiltradas.value === null
              ? strings.transacoes.carregandoTransacoes
              : strings.transacoes.adicionePrimeiraTransacao}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ width: "100%" }}>
      <CardContent sx={{ padding: 0 }}>
        <List sx={{ width: "100%" }}>
          {transacoesFiltradas.value.map((transacao, index) => (
            <ListItem
              key={transacao.id}
              sx={{
                borderBottom:
                  index < transacoesFiltradas.value.length - 1
                    ? "1px solid #eee"
                    : "none",
                padding: { xs: 1.5, sm: 2 },
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "stretch", sm: "center" },
                gap: { xs: 1.5, sm: 2 },
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: { xs: "block", sm: "none" },
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flex: 1,
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${getCorTipo(transacao.tipo)}.main`,
                        width: 36,
                        height: 36,
                      }}
                    >
                      {getIconeTipo(transacao.tipo)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="600" noWrap>
                        {transacao.titulo}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatarData(transacao.data)}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h6"
                    color={`${getCorTipo(transacao.tipo)}.main`}
                    fontWeight="700"
                    sx={{ textAlign: "right" }}
                  >
                    {isReceita(transacao.tipo) ? "+" : "-"}
                    {formatarMoeda(transacao.valor)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1.5,
                  }}
                >
                  <Chip
                    label={
                      isReceita(transacao.tipo)
                        ? strings.transacoes.receita
                        : strings.transacoes.despesa
                    }
                    size="small"
                    color={getCorTipo(transacao.tipo)}
                    variant="outlined"
                  />
                  {transacao.categoria && (
                    <Chip
                      label={transacao.categoria.nome}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                {transacao.descricao && (
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1.5,
                    }}
                  >
                    {transacao.descricao}
                  </Typography>
                )}

                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditar(transacao)}
                    color="primary"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleExcluir(transacao)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              <Box
                sx={{
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  width: "100%",
                  gap: 2,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${getCorTipo(transacao.tipo)}.main`,
                    width: 40,
                    height: 40,
                  }}
                >
                  {getIconeTipo(transacao.tipo)}
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" noWrap>
                    {transacao.titulo}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {formatarData(transacao.data)}
                    </Typography>
                    {transacao.categoria && (
                      <Chip
                        label={transacao.categoria.nome}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {transacao.descricao && (
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mt: 0.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {transacao.descricao}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ textAlign: "right", minWidth: 120 }}>
                  <Typography
                    variant="h6"
                    color={`${getCorTipo(transacao.tipo)}.main`}
                    fontWeight="700"
                  >
                    {isReceita(transacao.tipo) ? "+" : "-"}
                    {formatarMoeda(transacao.valor)}
                  </Typography>
                  <Chip
                    label={
                      isReceita(transacao.tipo)
                        ? strings.transacoes.receita
                        : strings.transacoes.despesa
                    }
                    size="small"
                    color={getCorTipo(transacao.tipo)}
                    variant="outlined"
                  />
                </Box>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <IconButton
                    size="small"
                    onClick={() => handleEditar(transacao)}
                    color="primary"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleExcluir(transacao)}
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ListaTransacoes;
