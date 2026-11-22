/* ============================================================
   VIOLET+ — MONTA OS CARDS DO CATÁLOGO A PARTIR DA API
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("cards");
  if (!container) return;

  // Garante que os filmes da API foram carregados
  await window.VIOLET.carregarFilmes();
  const filmes = window.VIOLET.filmes;

  if (!filmes.length) {
    container.innerHTML = `
      <p style="color:#aaa0bb; grid-column: 1 / -1; text-align:center; padding:20px;">
        Nenhum filme cadastrado ainda.<br>
        Cadastre pela dashboard e recarregue esta página.
      </p>`;
    return;
  }

  // Monta um card por filme
  container.innerHTML = filmes
    .map(
      (f) => `
        <article class="card">
          <a href="filme.html?id=${encodeURIComponent(f.id)}" class="poster">
            <img src="${f.imagem}" alt="${f.titulo}"
                 onerror="this.src='https://via.placeholder.com/300x450/1a1225/c084fc?text=Sem+Imagem'">
            <span class="ver-mais"><i data-lucide="plus"></i></span>
          </a>
          <div class="card-info">
            <h3>${f.titulo}</h3>
            <p>${f.genero}</p>
          </div>
        </article>
      `
    )
    .join("");

  // Re-renderiza os ícones do lucide
  if (window.lucide) lucide.createIcons();
});