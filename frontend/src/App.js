import { Box, CircularProgress, CssBaseline, Typography } from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import AppPrincipal from "./componentes/AppPrincipal";
import FormularioAutenticacao from "./componentes/FormularioAutenticacao";
import ModaisGlobais from "./componentes/ModaisGlobais";
import {
  carregandoAutenticacao,
  estaLogado,
  verificarTokenExistente,
} from "./estado/autenticacao";
import strings from "./strings";

function App() {
  useSignals();

  useEffect(() => {
    verificarTokenExistente();
  }, []);

  if (carregandoAutenticacao.value) {
    return (
      <>
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            background: "linear-gradient(135deg, #667eea 0%, #360764ff 100%)",
          }}
        >
          <CircularProgress
            size={60}
            sx={{ color: "white", marginBottom: 2 }}
          />
          <Typography variant="h6" color="white">
            {strings.geral.carregando} {strings.geral.nomeAplicacao}
          </Typography>
        </Box>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <ModaisGlobais />
      {estaLogado.value ? <AppPrincipal /> : <FormularioAutenticacao />}
    </>
  );
}

export default App;
