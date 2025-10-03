import strings from "../strings";

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

export const formatarData = (data) => {
  if (!data) return "-";

  if (typeof data === "string" && data.match(/^\d{4}-\d{2}-\d{2}T/)) {
    const [dataApenas] = data.split("T");
    const [ano, mes, dia] = dataApenas.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return new Date(data).toLocaleDateString("pt-BR");
};

export const formatarDataHora = (data) => {
  if (!data) return "-";

  if (typeof data === "string" && data.match(/^\d{4}-\d{2}-\d{2}T/)) {
    const [dataApenas, horaCompleta] = data.split("T");
    const [ano, mes, dia] = dataApenas.split("-");
    const [hora] = horaCompleta.split(".");
    const [hh, mm] = hora.split(":");
    return `${dia}/${mes}/${ano} ${hh}:${mm}`;
  }

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

  return strings.resumo.arrayMeses[numeroMes - 1] || "Mês inválido";
};
