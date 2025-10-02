import { Login, PersonAdd } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { useForm } from "react-hook-form";
import {
  alternarModo,
  carregando,
  definirErro,
  erro,
  fazerLogin,
  limparErro,
  mostrandoLogin,
} from "../estado/autenticacao";
import {
  mostrarModalErro,
  mostrarModalErroCredenciais,
} from "../estado/modais";
import { authFields } from "../fields";
import { autenticacaoAPI } from "../servicos/api";
import strings from "../strings";

const FormularioAutenticacao = () => {
  useSignals();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const aoEnviar = async (dados) => {
    limparErro();

    const callbackSucessoLogin = (resposta) => {
      if (resposta.sucesso && resposta.dados) {
        fazerLogin(resposta.dados.usuario, resposta.dados.token);
        reset();
      }
    };

    const callbackSucessoCadastro = (resposta) => {
      if (resposta.sucesso) {
        mostrarModalErro(
          strings.autenticacao.sucessoCadastro,
          strings.autenticacao.sucessoCadastroDescricao,
          "success",
          () => {
            reset();
            mostrandoLogin.value = true;
          }
        );
      }
    };

    const callbackErro = (mensagem) => {
      // pior solução possivel possivel porem mais rapido de implementar
      if (
        mostrandoLogin.value &&
        (mensagem.toLowerCase().includes("incorret") ||
          mensagem.toLowerCase().includes("invalid") ||
          mensagem.toLowerCase().includes("credenciais") ||
          mensagem.toLowerCase().includes("senha incorret") ||
          mensagem.toLowerCase().includes("email ou senha"))
      ) {
        mostrarModalErroCredenciais(
          () => {
            limparErro();
            reset();
            alternarModo();
          },
          () => {
            limparErro();
          }
        );
      } else {
        definirErro(mensagem);
      }
    };

    if (mostrandoLogin.value) {
      autenticacaoAPI.login(
        dados.email,
        dados.senha,
        callbackSucessoLogin,
        callbackErro
      );
    } else {
      autenticacaoAPI.cadastro(
        dados.nomeCompleto,
        dados.email,
        dados.senha,
        callbackSucessoCadastro,
        callbackErro
      );
    }
  };

  const trocarModo = () => {
    reset();
    alternarModo();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, rgb(208, 148, 234) 0%, rgb(188, 128, 214) 100%)",
        padding: 2,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ padding: 4 }}>
          <Box sx={{ textAlign: "center", marginBottom: 3 }}>
            {mostrandoLogin.value ? (
              <Login sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            ) : (
              <PersonAdd sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
            )}
            <Typography variant="h4" component="h1" gutterBottom>
              {mostrandoLogin.value
                ? strings.autenticacao.tituloLogin
                : strings.autenticacao.tituloCadastro}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {mostrandoLogin.value
                ? strings.autenticacao.descricaoLogin
                : strings.autenticacao.descricaoCadastro}
            </Typography>
          </Box>
          {erro.value && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {erro.value}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(aoEnviar)}>
            {!mostrandoLogin.value && (
              <TextField
                fullWidth
                label={authFields.nomeCompleto.label}
                type={authFields.nomeCompleto.type}
                margin="normal"
                placeholder={authFields.nomeCompleto.placeholder}
                autoComplete={authFields.nomeCompleto.autoComplete}
                {...register(
                  authFields.nomeCompleto.name,
                  authFields.nomeCompleto.validation
                )}
                error={!!errors.nomeCompleto}
                helperText={errors.nomeCompleto?.message}
                disabled={carregando.value}
              />
            )}
            <TextField
              fullWidth
              label={authFields.email.label}
              type={authFields.email.type}
              margin="normal"
              placeholder={authFields.email.placeholder}
              autoComplete={authFields.email.autoComplete}
              {...register(authFields.email.name, authFields.email.validation)}
              error={!!errors.email}
              helperText={errors.email?.message}
              disabled={carregando.value}
            />
            <TextField
              fullWidth
              label={authFields.senha.label}
              type={authFields.senha.type}
              margin="normal"
              placeholder={authFields.senha.placeholder}
              autoComplete={authFields.senha.autoComplete}
              {...register(authFields.senha.name, authFields.senha.validation)}
              error={!!errors.senha}
              helperText={errors.senha?.message}
              disabled={carregando.value}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={carregando.value}
              sx={{ marginTop: 3, marginBottom: 2 }}
            >
              {carregando.value ? (
                <>
                  <CircularProgress size={20} sx={{ marginRight: 1 }} />
                  {mostrandoLogin.value
                    ? strings.autenticacao.carregandoLogin
                    : strings.autenticacao.carregandoCadastro}
                </>
              ) : (
                <>
                  {mostrandoLogin.value
                    ? strings.autenticacao.botaoLogin
                    : strings.autenticacao.botaoCadastro}
                </>
              )}
            </Button>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="body2" color="textSecondary">
                {mostrandoLogin.value
                  ? strings.autenticacao.textoSemConta
                  : strings.autenticacao.textoComConta}
                <Link
                  component="button"
                  type="button"
                  onClick={trocarModo}
                  sx={{ cursor: "pointer" }}
                  disabled={carregando.value}
                >
                  {mostrandoLogin.value
                    ? strings.autenticacao.linkParaCadastro
                    : strings.autenticacao.linkParaLogin}
                </Link>
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FormularioAutenticacao;
