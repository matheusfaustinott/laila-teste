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
import { abrirFormularioTransacao } from "../estado/transacoes";
import { transacoesAPI } from "../servicos/api";
import strings from "../strings";
import { formatarData, formatarMoeda } from "../utils/formatadores";

const ListaTransacoes = ({ transacoes, onAtualizar }) => {
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
    const tipoUpperCase = tipo?.toUpperCase();
    return tipoUpperCase === "RECEITA" ? "success" : "error";
  };

  const getIconeTipo = (tipo) => {
    const tipoUpperCase = tipo?.toUpperCase();
    return tipoUpperCase === "RECEITA" ? <TrendingUp /> : <TrendingDown />;
  };

  if (!transacoes || transacoes.length === 0) {
    return (
      <Card>
        <CardContent sx={{ textAlign: "center", padding: 4 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {strings.transacoes.nenhumaTransacaoEncontrada}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {transacoes === null
              ? strings.transacoes.carregandoTransacoes
              : strings.transacoes.adicionePrimeiraTransacao}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ padding: 0 }}>
        <List>
          {transacoes.map((transacao, index) => (
            <ListItem
              key={transacao.id}
              sx={{
                borderBottom:
                  index < transacoes.length - 1 ? "1px solid #eee" : "none",
                padding: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
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
                <Box sx={{ flex: 1 }}>
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
                        marginTop: 0.5,
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
                    fontWeight="bold"
                  >
                    {transacao.tipo?.toUpperCase() === "DESPESA" ? "-" : "+"}
                    {formatarMoeda(transacao.valor)}
                  </Typography>
                  <Chip
                    label={
                      transacao.tipo?.toUpperCase() === "RECEITA"
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
                    title={strings.geral.editar}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleExcluir(transacao)}
                    color="error"
                    title={strings.geral.excluir}
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
