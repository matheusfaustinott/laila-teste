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

  // Função para mostrar confirmação de logout
  const handleLogout = () => {
    mostrarModalConfirmacao(
      strings.autenticacao.tituloConfirmacaoLogout,
      strings.autenticacao.mensagemConfirmacaoLogout,
      () => {
        // Callback de confirmação
        const callbackSucesso = () => {
          fazerLogout();
        };

        autenticacaoAPI.logout(callbackSucesso);
      },
      null, // Callback de cancelamento (padrão)
      {
        textoConfirmar: strings.autenticacao.botaoLogout,
        textoCancelar: strings.geral.cancelar,
        tipoConfirmar: "error",
      }
    );
  };

  // Extrai primeira letra do nome para o avatar
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
      {/* Header */}
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

      {/* Card de boas-vindas */}
      <Card sx={{ marginBottom: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              {primeiraLetra}
            </Avatar>
            <Box>
              <Typography variant="h5" gutterBottom>
                Olá, {usuarioLogado.value?.nomeCompleto || "Usuário"}!
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

      {/* Cards de funcionalidades */}
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        }}
      >
        {/* Card Transações */}
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
            <Typography variant="body2" color="textSecondary" paragraph>
              {strings.geral.gerencieTransacoesTexto}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaTransacoes}>
              Acessar
            </Button>
          </CardContent>
        </Card>

        {/* Card Categorias */}
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
            <Typography variant="body2" color="textSecondary" paragraph>
              {strings.geral.organizeCategorias}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaCategorias}>
              Acessar
            </Button>
          </CardContent>
        </Card>

        {/* Card Relatórios */}
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
            <Typography variant="body2" color="textSecondary" paragraph>
              {strings.geral.acompanheResumo}
            </Typography>
            <Button variant="contained" size="small" onClick={irParaResumo}>
              Acessar
            </Button>
          </CardContent>
        </Card>
      </Box>

      {/* Informações de desenvolvimento */}
      <Card sx={{ marginTop: 3, backgroundColor: "#f5f5f5" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {strings.geral.statusSistema}
          </Typography>
          <Typography variant="body2" paragraph>
            ✅ Autenticação funcionando
            <br />
            {strings.geral.sistemaSignals}
            <br />
            ✅ Interface com Material-UI
            <br />
            ✅ Formulários com React Hook Form
            <br />
            ✅ Padrão de cores Lailla aplicado
            <br />
            ✅ Componentes em minúscula
            <br />
            🔄 Funcionalidades em desenvolvimento...
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Desenvolvido por Matheus Faustino
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPrincipal;
