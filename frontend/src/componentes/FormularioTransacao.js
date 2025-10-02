import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { categorias } from "../estado/categorias";
import {
  fecharFormularioTransacao,
  modoEdicao,
  mostrandoFormularioTransacao,
  transacaoAtual,
} from "../estado/transacoes";
import { transactionFields } from "../fields";
import { transacoesAPI } from "../servicos/api";
import strings from "../strings";

const FormularioTransacao = ({ onSucesso }) => {
  useSignals();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm();

  const watchTipo = watch("tipo");

  useEffect(() => {
    if (mostrandoFormularioTransacao.value) {
      if (modoEdicao.value && transacaoAtual.value) {
        const transacao = transacaoAtual.value;
        setValue("titulo", transacao.titulo);
        setValue("valor", transacao.valor);
        setValue("tipo", transacao.tipo);
        setValue("categoriaId", transacao.categoria?.id || "");
        setValue("data", transacao.data?.split("T")[0] || ""); // Formata para input date
        setValue("observacoes", transacao.observacoes || "");
      } else {
        reset();
        const hoje = new Date().toISOString().split("T")[0];
        setValue("data", hoje);
      }
    }
  }, [
    mostrandoFormularioTransacao.value,
    modoEdicao.value,
    transacaoAtual.value,
    setValue,
    reset,
  ]);

  const handleFechar = () => {
    fecharFormularioTransacao();
    reset();
  };

  const onSubmit = (dados) => {
    const dadosFormatados = {
      ...dados,
      valor: parseFloat(dados.valor),
      categoriaId: dados.categoriaId || null,
      observacoes: dados.observacoes || null,
    };

    const callbackSucesso = () => {
      handleFechar();
      if (onSucesso) {
        onSucesso();
      }
    };

    if (modoEdicao.value && transacaoAtual.value) {
      transacoesAPI.atualizar(
        transacaoAtual.value.id,
        dadosFormatados,
        callbackSucesso
      );
    } else {
      transacoesAPI.criar(dadosFormatados, callbackSucesso);
    }
  };

  const titulo = modoEdicao.value
    ? strings.transacoes.editarTransacao
    : strings.transacoes.novaTransacao;

  const textoBotao = modoEdicao.value
    ? strings.geral.salvar
    : strings.transacoes.adicionarTransacao;

  return (
    <Dialog
      open={mostrandoFormularioTransacao.value}
      onClose={handleFechar}
      maxWidth="sm"
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogTitle>{titulo}</DialogTitle>

        <DialogContent sx={{ paddingTop: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              fullWidth
              label={transactionFields.titulo.label}
              placeholder={transactionFields.titulo.placeholder}
              error={!!errors.titulo}
              helperText={errors.titulo?.message}
              {...register("titulo", transactionFields.titulo.validation)}
            />
            <TextField
              fullWidth
              type="number"
              inputProps={{
                step: transactionFields.valor.step,
                min: 0,
              }}
              label={transactionFields.valor.label}
              placeholder={transactionFields.valor.placeholder}
              error={!!errors.valor}
              helperText={errors.valor?.message}
              {...register("valor", transactionFields.valor.validation)}
            />
            <FormControl fullWidth error={!!errors.tipo}>
              <InputLabel>{transactionFields.tipo.label}</InputLabel>
              <Select
                label={transactionFields.tipo.label}
                {...register("tipo", transactionFields.tipo.validation)}
                value={watchTipo || ""}
              >
                {transactionFields.tipo.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.tipo && (
                <FormHelperText>{errors.tipo.message}</FormHelperText>
              )}
            </FormControl>
            <FormControl fullWidth error={!!errors.categoriaId}>
              <InputLabel>{transactionFields.categoria.label}</InputLabel>
              <Select
                label={transactionFields.categoria.label}
                {...register(
                  "categoriaId",
                  transactionFields.categoria.validation
                )}
                defaultValue=""
              >
                {categorias.value.map((categoria) => (
                  <MenuItem key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </MenuItem>
                ))}
              </Select>
              {errors.categoriaId && (
                <FormHelperText>{errors.categoriaId.message}</FormHelperText>
              )}
            </FormControl>
            <TextField
              fullWidth
              type="date"
              label={transactionFields.data.label}
              error={!!errors.data}
              helperText={errors.data?.message}
              InputLabelProps={{ shrink: true }}
              {...register("data", transactionFields.data.validation)}
            />
            <TextField
              fullWidth
              multiline
              rows={transactionFields.observacoes.rows}
              label={transactionFields.observacoes.label}
              placeholder={transactionFields.observacoes.placeholder}
              error={!!errors.observacoes}
              helperText={errors.observacoes?.message}
              {...register(
                "observacoes",
                transactionFields.observacoes.validation
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 3 }}>
          <Button onClick={handleFechar} color="inherit">
            {strings.geral.cancelar}
          </Button>
          <Button type="submit" variant="contained">
            {textoBotao}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FormularioTransacao;
