document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painel-ingressos");
  const btnVoltar = document.getElementById("btn-voltar");

  if (!painel) return;

  if (btnVoltar) {
    btnVoltar.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.history.length > 1) window.history.back();
      else window.location.href = "index.html#filmes";
    });
  }

  // ⚠️ NOVO: aguarda a API (pra buscar o filme pelo id)
  await window.VIOLET.carregarFilmes();

  // Lê os parâmetros da URL
  const params = new URLSearchParams(window.location.search);
  const idUrl = params.get("id");
  const sessaoUrl = params.get("sessao");
  const sessaoIdUrl = params.get("sessaoId");     // ⚠️ NOVO
  const precoUrl = Number(params.get("preco"));   // ⚠️ NOVO

  const filme = window.VIOLET?.buscarFilme(idUrl);

  // Erro: precisa ter filme, sessão e preço
  if (!filme || !sessaoUrl || !sessaoIdUrl || !precoUrl) {
    painel.innerHTML = `
      <div class="erro">
        <h2>Nenhum ingresso por aqui</h2>
        <p>Não encontramos esse filme ou a sessão não foi informada.<br>
        Volte ao catálogo e escolha um filme e uma sessão.</p>
        <a href="index.html#filmes" class="btn">
          <i data-lucide="arrow-left"></i> Voltar aos filmes
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // ⚠️ Agora usa o preço REAL da sessão (não mais PRECO_INGRESSO fixo)
  const PRECO = precoUrl;
  const MAX = 10;

  let quantidade = 1;

  // ---------- Renderiza o painel ----------
  painel.innerHTML = `
    <div class="painel">
      <div class="painel-header">
        <span class="painel-subtitulo">VIOLET+ CINEMA</span>
        <h1 class="painel-titulo">Seus ingressos</h1>
      </div>

      <div class="filme-escolhido">
        <img src="${filme.imagem}" alt="${filme.titulo}"
             onerror="this.src='https://via.placeholder.com/80x118/1a1225/c084fc?text=?'" />
        <div class="filme-escolhido-info">
          <small>VOCÊ ESCOLHEU</small>
          <h3>${filme.titulo}</h3>
          <span class="badge-sessao">
            <i data-lucide="clock"></i>
            ${sessaoUrl}
          </span>
        </div>
      </div>

      <div class="secao">
        <strong class="secao-titulo">Quantidade de ingressos</strong>
        <p class="secao-desc">Selecione quantos ingressos deseja comprar.</p>

        <div class="quantidade-box">
          <button class="qtd-btn" id="btn-menos" disabled aria-label="Diminuir">
            <i data-lucide="minus"></i>
          </button>
          <div class="qtd-numero">
            <strong id="qtd-valor">1</strong>
            <small id="qtd-label">ingresso</small>
          </div>
          <button class="qtd-btn" id="btn-mais" aria-label="Aumentar">
            <i data-lucide="plus"></i>
          </button>
        </div>

        <p class="limite">Mínimo de 1 e máximo de ${MAX} ingressos</p>
      </div>

      <div class="divisor"></div>

      <div class="secao">
        <strong class="secao-titulo">Resumo do pedido</strong>

        <div class="resumo">
          <div class="resumo-linha">
            <span>Valor por ingresso</span>
            <span>${window.VIOLET.dinheiro(PRECO)}</span>
          </div>
          <div class="resumo-linha">
            <span>Quantidade</span>
            <span id="resumo-qtd">1x</span>
          </div>
          <div class="resumo-linha">
            <span>Subtotal</span>
            <span id="resumo-subtotal">${window.VIOLET.dinheiro(PRECO)}</span>
          </div>
          <div class="resumo-linha">
            <span>Taxa de serviço</span>
            <span id="resumo-taxa">${window.VIOLET.dinheiro(0)}</span>
          </div>

          <div class="resumo-total">
            <span class="label">TOTAL DO PEDIDO</span>
            <span class="valor" id="resumo-total">${window.VIOLET.dinheiro(PRECO)}</span>
          </div>
        </div>
      </div>

      <button class="cta" id="btn-continuar">
        Continuar para pagamento
        <i data-lucide="arrow-right"></i>
      </button>

      <div class="aviso-seguranca">
        <i data-lucide="shield-check"></i>
        Confira os dados antes de continuar.
      </div>
    </div>
  `;

  // Referências
  const btnMenos = document.getElementById("btn-menos");
  const btnMais = document.getElementById("btn-mais");
  const qtdValor = document.getElementById("qtd-valor");
  const qtdLabel = document.getElementById("qtd-label");
  const resumoQtd = document.getElementById("resumo-qtd");
  const resumoSub = document.getElementById("resumo-subtotal");
  const resumoTaxa = document.getElementById("resumo-taxa");
  const resumoTotal = document.getElementById("resumo-total");
  const btnContinuar = document.getElementById("btn-continuar");

  function atualizar() {
    btnMenos.disabled = quantidade <= 1;
    btnMais.disabled = quantidade >= MAX;

    qtdValor.textContent = quantidade;
    qtdLabel.textContent = quantidade === 1 ? "ingresso" : "ingressos";
    resumoQtd.textContent = `${quantidade}x`;

    const { subtotal, taxa, total } = window.VIOLET.calcularTotal(quantidade, PRECO);
    resumoSub.textContent = window.VIOLET.dinheiro(subtotal);
    resumoTaxa.textContent = window.VIOLET.dinheiro(taxa);
    resumoTotal.textContent = window.VIOLET.dinheiro(total);
  }

  btnMenos.addEventListener("click", () => {
    if (quantidade > 1) { quantidade--; atualizar(); }
  });

  btnMais.addEventListener("click", () => {
    if (quantidade < MAX) { quantidade++; atualizar(); }
  });

  btnContinuar.addEventListener("click", () => {
    // ⚠️ Passa sessaoId e preco pra pagamento.html
    window.location.href =
      `pagamento.html?id=${encodeURIComponent(filme.id)}` +
      `&sessaoId=${encodeURIComponent(sessaoIdUrl)}` +
      `&sessao=${encodeURIComponent(sessaoUrl)}` +
      `&quantidade=${quantidade}` +
      `&preco=${encodeURIComponent(PRECO)}`;
  });

  atualizar();
  if (window.lucide) lucide.createIcons();
});