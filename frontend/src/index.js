import { ThemeProvider, createTheme } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const tema = createTheme({
  palette: {
    primary: {
      main: "rgba(92, 56, 107, 1)",
      light: "rgb(228, 188, 244)",
      dark: "rgba(63, 9, 87, 1)",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "rgba(54, 6, 75, 1)",
      light: "rgba(110, 67, 124, 1)",
      dark: "rgba(59, 12, 78, 1)",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f44336",
      light: "#ff7961",
      dark: "#ba000d",
    },
    warning: {
      main: "#ff9800",
      light: "#ffb74d",
      dark: "#f57c00",
    },
    success: {
      main: "#4caf50",
      light: "#81c784",
      dark: "#388e3c",
    },
    background: {
      default: "#fafafa",
      paper: "#ffffff",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h4: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h5: {
      fontWeight: 500,
      fontSize: "1.5rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1.25rem",
    },
    button: {
      fontWeight: 500,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: 8,
          padding: "10px 24px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 2px 8px rgba(208, 148, 234, 0.3)",
          },
        },
        contained: {
          background:
            "linear-gradient(135deg, rgba(85, 8, 117, 1) 0%, rgb(188, 128, 214) 100%)",
          "&:hover": {
            background:
              "linear-gradient(135deg, rgba(89, 16, 121, 1) 0%, rgb(148, 88, 174) 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
          borderRadius: 12,
          border: "1px solid rgba(0, 0, 0, 0.05)",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={tema}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
