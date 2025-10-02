import { CheckCircle, Close, Error, Info, Warning } from "@mui/icons-material";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import {
  cancelarAcao,
  confirmarAcao,
  fecharModalErro,
  fecharModalErroCredenciais,
  irParaCadastroDoModal,
  modalCarregamento,
  modalConfirmacao,
  modalErro,
  modalErroCredenciais,
} from "../estado/modais";
import strings from "../strings";

const ModaisGlobais = () => {
  useSignals();

  const obterIconePorTipo = (tipo) => {
    switch (tipo) {
      case "error":
        return <Error color="error" />;
      case "warning":
        return <Warning color="warning" />;
      case "success":
        return <CheckCircle color="success" />;
      case "info":
      default:
        return <Info color="info" />;
    }
  };
  const obterTipoErro = (tipo) => {
    switch (tipo) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "success":
        return "success";
      case "info":
      default:
        return "info";
    }
  };

  return (
    <>
      <Dialog
        open={modalErro.value.aberto}
        onClose={fecharModalErro}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingBottom: 1,
          }}
        >
          {obterIconePorTipo(modalErro.value.tipo)}
          {modalErro.value.titulo}
          <IconButton
            aria-label="fechar"
            onClick={fecharModalErro}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Alert
            severity={obterTipoErro(modalErro.value.tipo)}
            sx={{ mt: 1 }}
            variant="outlined"
          >
            {modalErro.value.mensagem}
          </Alert>
        </DialogContent>

        <DialogActions sx={{ padding: 2 }}>
          <Button
            onClick={fecharModalErro}
            variant="contained"
            color="primary"
            fullWidth
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={modalConfirmacao.value.aberto}
        onClose={cancelarAcao}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingBottom: 1,
          }}
        >
          <Warning color="warning" />
          {modalConfirmacao.value.titulo}
        </DialogTitle>

        <DialogContent>
          <Typography variant="body1" sx={{ mt: 1 }}>
            {modalConfirmacao.value.mensagem}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ padding: 2, gap: 1 }}>
          <Button
            onClick={cancelarAcao}
            variant="outlined"
            color="inherit"
            sx={{ flex: 1 }}
          >
            {modalConfirmacao.value.textoCancelar}
          </Button>
          <Button
            onClick={confirmarAcao}
            variant="contained"
            color={modalConfirmacao.value.tipoConfirmar}
            sx={{ flex: 1 }}
          >
            {modalConfirmacao.value.textoConfirmar}
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        open={modalCarregamento.value.aberto}
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: "rgba(208, 148, 234, 0.8)",
          backdropFilter: "blur(4px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: 3,
            borderRadius: 2,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          }}
        >
          <CircularProgress color="inherit" size={60} thickness={4} />
          {modalCarregamento.value.mensagem && (
            <Typography variant="h6" color="inherit" textAlign="center">
              {modalCarregamento.value.mensagem}
            </Typography>
          )}
        </Box>
      </Backdrop>
      <Dialog
        open={modalErroCredenciais.value.aberto}
        onClose={fecharModalErroCredenciais}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            padding: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            paddingBottom: 1,
          }}
        >
          <Error color="error" />
          {strings.autenticacao.tituloErroCredenciais}
          <IconButton
            aria-label="fechar"
            onClick={fecharModalErroCredenciais}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Alert severity="error" sx={{ mt: 1 }} variant="outlined">
            {strings.autenticacao.mensagemErroCredenciais}
          </Alert>
        </DialogContent>

        <DialogActions sx={{ gap: 1, padding: 2 }}>
          <Button
            onClick={fecharModalErroCredenciais}
            color="inherit"
            sx={{ flex: 1 }}
          >
            {strings.autenticacao.botaoTentarNovamente}
          </Button>
          <Button
            onClick={irParaCadastroDoModal}
            variant="contained"
            color="primary"
            sx={{ flex: 1 }}
          >
            {strings.autenticacao.botaoCadastrarAgora}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ModaisGlobais;
