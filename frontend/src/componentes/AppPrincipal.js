import { useSignals } from "@preact/signals-react/runtime";
import { telaAtual } from "../estado/navegacao";
import DashboardPrincipal from "./DashboardPrincipal";
import GerenciadorCategorias from "./GerenciadorCategorias";
import GerenciadorTransacoes from "./GerenciadorTransacoes";
import ResumoMensal from "./ResumoMensal";

const AppPrincipal = () => {
  useSignals();

  const renderizarTela = () => {
    switch (telaAtual.value) {
      case "transacoes":
        return <GerenciadorTransacoes />;
      case "categorias":
        return <GerenciadorCategorias />;
      case "resumo":
        return <ResumoMensal />;
      case "dashboard":
      default:
        return <DashboardPrincipal />;
    }
  };

  return renderizarTela();
};

export default AppPrincipal;
