import strings from "../strings";

export const formatarMoeda = (valor) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
};

export const formatarData = (data) => {
  if (!data) return "-";

  if (typeof data === "string") {
    if (data.match(/^\d{4}-\d{2}-\d{2}T/)) {
      const [dataApenas] = data.split("T");
      const [ano, mes, dia] = dataApenas.split("-");
      return `${dia}/${mes}/${ano}`;
    }

    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = data.split("-");
      return `${dia}/${mes}/${ano}`;
    }
  }

  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return "-";

  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(dataObj.getUTCDate()).padStart(2, "0");

  return `${dia}/${mes}/${ano}`;
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

  const dataObj = new Date(data);
  if (isNaN(dataObj.getTime())) return "-";

  const ano = dataObj.getUTCFullYear();
  const mes = String(dataObj.getUTCMonth() + 1).padStart(2, "0");
  const dia = String(dataObj.getUTCDate()).padStart(2, "0");
  const hh = String(dataObj.getUTCHours()).padStart(2, "0");
  const mm = String(dataObj.getUTCMinutes()).padStart(2, "0");

  return `${dia}/${mes}/${ano} ${hh}:${mm}`;
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
