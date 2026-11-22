/* ============================================================
   VIOLET+ — FONTE DE DADOS DOS FILMES (agora vinda da API)
   ============================================================ */

// ⚠️ Ajuste a porta se o dotnet run subir em outra (veja no console)
const API = "http://localhost:5000/api";

const PRECO_INGRESSO_PADRAO = 25.0; 
const TAXA_SERVICO = 0;             

let filmes = [];        
let carregando = null;  

function converterFilme(f) {
  return {
    id: f.id,
    titulo: f.nome,               
    genero: f.genero,
    duracao: formatarDuracao(f.duracaoMinutos),
    precoBase: Number(f.precoBase),
    ativo: f.ativo,

imagem: f.imagem
  ? `http://localhost:5000${f.imagem}`
  : "https://via.placeholder.com/300x450/1a1225/c084fc?text=Sem+Imagem",
    // ----- placeholders (a API ainda não tem) -----
    ano: "—",
    classificacao: "L",
    sinopse: f.sinopse ||"Sinopse não cadastrada.",

    sessoes: [],
  };
}

function formatarDuracao(minutos) {
  if (!minutos || minutos < 60) return `${minutos || 0}min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

function carregarFilmes() {
  if (carregando) return carregando;

  carregando = fetch(`${API}/filme`)
    .then((res) => {
      if (!res.ok) throw new Error(`API respondeu ${res.status}`);
      return res.json();
    })
    .then((lista) => {
      filmes = lista.map(converterFilme);
      return filmes;
    })
    .catch((erro) => {
      console.error("Erro ao carregar filmes:", erro);
      filmes = [];
      return [];
    });

  return carregando;
}

function buscarFilme(idOuAlias) {
  if (idOuAlias == null) return null;
  const chave = String(idOuAlias).trim().toLowerCase();
  return filmes.find((f) => String(f.id) === chave) || null;
}

function dinheiro(valor) {
  return Number(valor).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function calcularTotal(quantidade, precoUnitario = PRECO_INGRESSO_PADRAO) {
  const subtotal = precoUnitario * quantidade;
  const taxa = subtotal * TAXA_SERVICO;
  return { subtotal, taxa, total: subtotal + taxa };
}

window.VIOLET = {
  get filmes() { return filmes; },
  carregarFilmes,
  buscarFilme,
  dinheiro,
  calcularTotal,
  PRECO_INGRESSO: PRECO_INGRESSO_PADRAO,
  TAXA_SERVICO,
  API,
};

carregarFilmes();