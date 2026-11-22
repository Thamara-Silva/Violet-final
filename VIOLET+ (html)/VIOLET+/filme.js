/* ============================================
   VIOLET+ — DETALHES DO FILME
   Lê ?id= da URL, resolve via buscarFilme()
   e monta a tela. Busca sessões reais da API
   e navega p/ ingressos.html com sessaoId.
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("conteudo-filme");
  if (!container) return;

  // Aguarda os filmes da API
  await window.VIOLET.carregarFilmes();

  // Lê ?id= da URL
  const params = new URLSearchParams(window.location.search);
  const idUrl = params.get("id");
  const filme = window.VIOLET?.buscarFilme(idUrl);

  // ---------- Filme não encontrado ----------
  if (!filme) {
    container.innerHTML = `
      <div class="nao-encontrado">
        <i data-lucide="film"></i>
        <h2>Filme não encontrado</h2>
        <p>Não conseguimos localizar esse título. Volte ao catálogo e escolha outro.</p>
        <a href="index.html#filmes" class="btn">
          <i data-lucide="arrow-left"></i> Voltar aos filmes
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  document.title = `${filme.titulo} | Violet+`;

  // ---------- Renderiza o card do filme ----------
  container.innerHTML = `
    <article class="filme-card">
      <img
        class="filme-poster"
        src="${filme.imagem}"
        alt="Pôster de ${filme.titulo}"
        onerror="this.src='https://via.placeholder.com/300x450/1a1225/c084fc?text=Sem+Imagem'"
      />

      <div class="filme-info">
        <span class="filme-etiqueta">
          <i data-lucide="ticket"></i>
          DISPONÍVEL EM CARTAZ
        </span>

        <h1 class="filme-titulo">${filme.titulo}</h1>

        <div class="filme-meta">
          <span>${filme.ano}</span>
          <span>${filme.genero}</span>
          <span>${filme.duracao}</span>
          <span>${filme.classificacao === "L" ? "Livre" : filme.classificacao + " anos"}</span>
        </div>

        <div class="filme-linha"></div>

        <p class="filme-sinopse">${filme.sinopse}</p>

        <div class="filme-secao-titulo">
          <i data-lucide="clock"></i>
          Escolha uma sessão
        </div>

        <div id="sessoes-wrapper">
          <p style="color:#aaa0bb; font-size:0.85rem;">Carregando sessões…</p>
        </div>

        <div class="filme-aviso" id="aviso">
          <i data-lucide="info"></i>
          Selecione uma sessão para continuar.
        </div>

        <button class="filme-cta" id="btn-comprar" disabled>
          Comprar ingresso
          <i data-lucide="arrow-right"></i>
        </button>
      </div>
    </article>
  `;

  if (window.lucide) lucide.createIcons();

  // ============================================================
  // BUSCAR SESSÕES DA API
  // ============================================================
  const wrapper = document.getElementById("sessoes-wrapper");
  const btnComprar = document.getElementById("btn-comprar");
  const aviso = document.getElementById("aviso");

  let sessaoSelecionada = null;

  try {
    const url = `${window.VIOLET.API}/sessao?filmeId=${encodeURIComponent(filme.id)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API respondeu ${res.status}`);
    const sessoes = await res.json();

    if (!sessoes.length) {
      wrapper.innerHTML = `
        <p style="color:#aaa0bb; font-size:0.85rem;">
          Nenhuma sessão disponível para este filme.
        </p>`;
      return;
    }

    // ---------- Agrupa por data ----------
    // Agrupamos por "ano-mês-dia" pra ordenar certinho.
    // Depois formatamos pra exibir "Sex, 15/11".
    const grupos = {};
    sessoes.forEach((s) => {
      const d = new Date(s.dataHora);
      const chave = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      if (!grupos[chave]) grupos[chave] = [];
      grupos[chave].push(s);
    });

    // ---------- Renderiza ----------
    wrapper.innerHTML = "";

    // Ordena os dias (chave YYYY-MM-DD já ordena alfabeticamente)
    const diasOrdenados = Object.keys(grupos).sort();

    diasOrdenados.forEach((dia) => {
      const lista = grupos[dia];

      // Cabeçalho do dia (ex.: "Sex, 15/11")
      const dataObj = new Date(lista[0].dataHora);
      const labelDia = dataObj.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }).replace(",", "");

      const bloco = document.createElement("div");
      bloco.style.marginBottom = "14px";

      const titulo = document.createElement("div");
      titulo.style.cssText = "font-weight:700; font-size:0.9rem; margin-bottom:8px; color:#d4a0ff; text-transform:capitalize;";
      titulo.textContent = labelDia;
      bloco.appendChild(titulo);

      const linha = document.createElement("div");
      linha.className = "sessoes";

      // Ordena horários dentro do dia
      lista.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

      lista.forEach((s) => {
        const hora = new Date(s.dataHora).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const esgotado = s.assentosDisponiveis === 0;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "sessao";
        btn.dataset.sessaoId = s.id;
        btn.disabled = esgotado;

        btn.innerHTML = `
          <i data-lucide="clock"></i>
          ${hora} • ${s.sala} • ${window.VIOLET.dinheiro(s.preco)}
          ${esgotado ? " <small>(Esgotado)</small>" : ""}
        `;

        if (esgotado) {
          btn.style.opacity = "0.5";
          btn.style.cursor = "not-allowed";
        } else {
          btn.addEventListener("click", () => {
            sessaoSelecionada = s;

            // Desmarca todos e marca só esse
            wrapper.querySelectorAll(".sessao").forEach((el) => {
              el.classList.toggle("selecionada", el === btn);
            });

            btnComprar.disabled = false;
            aviso.style.display = "none";
          });
        }

        linha.appendChild(btn);
      });

      bloco.appendChild(linha);
      wrapper.appendChild(bloco);
    });

    if (window.lucide) lucide.createIcons();
  } catch (erro) {
    console.error("Erro ao buscar sessões:", erro);
    wrapper.innerHTML = `
      <p style="color:#d97a9a; font-size:0.85rem;">
        Não foi possível carregar as sessões. Tente novamente.
      </p>`;
  }

  // ============================================================
  // BOTÃO "COMPRAR INGRESSO"
  // ============================================================
  btnComprar.addEventListener("click", () => {
    if (!sessaoSelecionada) return;

    const s = sessaoSelecionada;
    const hora = new Date(s.dataHora).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // ⚠️ Passa TODOS os dados necessários pra ingressos.html
    // (Opção A: passar sessaoId, sessao, preco na URL)
    window.location.href =
      `ingressos.html?id=${encodeURIComponent(filme.id)}` +
      `&sessaoId=${encodeURIComponent(s.id)}` +
      `&sessao=${encodeURIComponent(hora)}` +
      `&preco=${encodeURIComponent(s.preco)}`;
  });
});