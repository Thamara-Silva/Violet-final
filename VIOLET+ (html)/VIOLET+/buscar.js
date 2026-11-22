// Executa o código depois que a página terminar de carregar.
document.addEventListener("DOMContentLoaded", async () => {
  const campoBusca = document.getElementById("buscarFilme");
  const listaSugestoes = document.getElementById("sugestoesFilmes");

  if (!campoBusca || !listaSugestoes) return;

  // Aguarda os filmes da API
  await window.VIOLET.carregarFilmes();

  // Ignora acentos e maiúsculas/minúsculas
  function normalizar(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function fecharSugestoes() {
    listaSugestoes.classList.remove("visivel");
    listaSugestoes.replaceChildren();
  }

  function criarSugestao(filme) {
    const link = document.createElement("a");
    link.className = "sugestao-filme";
    link.href = `filme.html?id=${encodeURIComponent(filme.id)}`;

    const imagem = document.createElement("img");
    imagem.src = filme.imagem;
    imagem.alt = `Pôster de ${filme.titulo}`;
    imagem.loading = "lazy";
    imagem.addEventListener("error", () => {
      imagem.src = "https://via.placeholder.com/42x58/1a1225/c084fc?text=?";
    });

    const informacoes = document.createElement("div");
    informacoes.className = "sugestao-info";

    const titulo = document.createElement("strong");
    titulo.textContent = filme.titulo;

    const genero = document.createElement("span");
    genero.textContent = filme.genero;

    informacoes.append(titulo, genero);
    link.append(imagem, informacoes);
    return link;
  }

  function buscarFilmes() {
    const termo = normalizar(campoBusca.value);
    listaSugestoes.replaceChildren();

    if (termo === "") {
      fecharSugestoes();
      return;
    }

    // Usa window.VIOLET.filmes (vindos da API)
    const resultados = window.VIOLET.filmes.filter((filme) => {
      return (
        normalizar(filme.titulo).includes(termo) ||
        normalizar(filme.genero).includes(termo)
      );
    });

    if (resultados.length === 0) {
      const mensagem = document.createElement("div");
      mensagem.className = "sem-resultados";
      mensagem.textContent = "Nenhum filme encontrado.";
      listaSugestoes.appendChild(mensagem);
    } else {
      resultados.forEach((filme) => {
        listaSugestoes.appendChild(criarSugestao(filme));
      });
    }

    listaSugestoes.classList.add("visivel");
  }

  campoBusca.addEventListener("input", buscarFilmes);

  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".busca-container")) fecharSugestoes();
  });

  campoBusca.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharSugestoes();
  });
});