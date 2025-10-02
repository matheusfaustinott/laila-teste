import {
  AccountCircle,
  Assessment,
  Category,
  ExitToApp,
  TrendingUp,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { fazerLogout, usuarioLogado } from "../estado/autenticacao";
import { mostrarModalConfirmacao } from "../estado/modais";
import {
  irParaCategorias,
  irParaResumo,
  irParaTransacoes,
} from "../estado/navegacao";
import { autenticacaoAPI } from "../servicos/api";
import strings from "../strings";

const DashboardPrincipal = () => {
  useSignals();

  const handleLogout = () => {
    mostrarModalConfirmacao(
      strings.autenticacao.tituloConfirmacaoLogout,
      strings.autenticacao.mensagemConfirmacaoLogout,
      () => {
        const callbackSucesso = () => {
          fazerLogout();
        };
        autenticacaoAPI.logout(callbackSucesso);
      },
      null,
      {
        textoConfirmar: strings.autenticacao.botaoLogout,
        textoCancelar: strings.geral.cancelar,
        tipoConfirmar: "error",
      }
    );
  };
  // Avatar do user
  const primeiraLetra = usuarioLogado.value?.nomeCompleto?.charAt(0);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, rgb(208, 148, 234) 0%, rgb(188, 128, 214) 100%)",
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 3,
        }}
      >
        <Typography variant="h4" color="white" fontWeight="bold">
          {strings.geral.nomeAplicacao}
        </Typography>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{ color: "white", borderColor: "white" }}
        >
          {strings.autenticacao.botaoLogout}
        </Button>
      </Box>
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              {primeiraLetra}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                {strings.geral.saudacaoUsuario.replace(
                  "{nome}",
                  usuarioLogado.value?.nomeCompleto || "Usuário"
                )}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {strings.geral.bemVindoCompleto}
              </Typography>
              <Chip
                icon={<AccountCircle />}
                label={usuarioLogado.value?.email}
                size="small"
                sx={{ marginTop: 1 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <TrendingUp color="primary" />
              <Typography variant="h6">{strings.geral.transacoes}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {strings.geral.gerencieTransacoesTexto}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaTransacoes}>
              {strings.geral.acessar}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <Category color="primary" />
              <Typography variant="h6">{strings.geral.categorias}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {strings.geral.organizeCategorias}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaCategorias}>
              {strings.geral.acessar}
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                marginBottom: 2,
              }}
            >
              <Assessment color="primary" />
              <Typography variant="h6">{strings.geral.resumoMensal}</Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              {strings.geral.acompanheResumo}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaResumo}>
              {strings.geral.acessar}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default DashboardPrincipal;
