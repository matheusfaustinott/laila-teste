// Campos de autenticação
import { stringsAutenticacao } from "../strings/authStrings";

export const authFields = {
  email: {
    name: "email",
    label: stringsAutenticacao.labelEmail,
    type: "email",
    required: true,
    validation: {
      required: stringsAutenticacao.emailObrigatorio,
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: stringsAutenticacao.emailInvalido,
      },
    },
    placeholder: stringsAutenticacao.placeholderEmail,
    autoComplete: "email",
  },

  senha: {
    name: "senha",
    label: stringsAutenticacao.labelSenha,
    type: "password",
    required: true,
    validation: {
      required: stringsAutenticacao.senhaObrigatoria,
      minLength: {
        value: 6,
        message: stringsAutenticacao.senhaMinima,
      },
    },
    placeholder: stringsAutenticacao.placeholderSenha,
    autoComplete: "current-password",
  },

  nomeCompleto: {
    name: "nomeCompleto",
    label: stringsAutenticacao.labelNomeCompleto,
    type: "text",
    required: true,
    validation: {
      required: stringsAutenticacao.nomeObrigatorio,
      minLength: {
        value: 2,
        message: stringsAutenticacao.nomeMinimo,
      },
    },
    placeholder: stringsAutenticacao.placeholderNomeCompleto,
    autoComplete: "name",
  },

  novaSenha: {
    name: "novaSenha",
    label: stringsAutenticacao.labelNovaSenha,
    type: "password",
    required: true,
    validation: {
      required: stringsAutenticacao.novaSenhaObrigatoria,
      minLength: {
        value: 6,
        message: stringsAutenticacao.senhaMinima,
      },
    },
    placeholder: stringsAutenticacao.placeholderNovaSenha,
    autoComplete: "new-password",
  },

  confirmarSenha: {
    name: "confirmarSenha",
    label: stringsAutenticacao.labelConfirmarSenha,
    type: "password",
    required: true,
    validation: {
      required: stringsAutenticacao.confirmarSenhaObrigatoria,
    },
    placeholder: stringsAutenticacao.placeholderConfirmarSenha,
    autoComplete: "new-password",
  },
};
