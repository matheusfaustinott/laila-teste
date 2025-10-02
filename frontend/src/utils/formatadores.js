export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

export const formatarData = (data) => {
  return new Date(data).toLocaleDateString("pt-BR");
};

export const formatarDataHora = (data) => {
  return new Date(data).toLocaleString("pt-BR");
};

export const formatarNumero = (numero, decimais = 0) => {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(numero);
};

export const formatarPorcentagem = (valor, decimais = 1) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(valor / 100);
};

export const formatarMes = (numeroMes) => {
  if (!numeroMes || isNaN(numeroMes)) {
    return "-";
  }

  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return meses[numeroMes - 1] || "Mês inválido";
};
