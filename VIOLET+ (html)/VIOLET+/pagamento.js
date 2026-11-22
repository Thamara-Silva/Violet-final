/* ============================================
   VIOLET+ — PAGAMENTO
   Lê ?id=, ?sessaoId=, ?sessao=, ?quantidade=, ?preco=
   Mostra resumo + formas de pagamento.
   No clique de "Pagar": POST /api/venda + localStorage + sucesso.html
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const painel = document.getElementById("painel-pagamento");
  const btnVoltar = document.getElementById("btn-voltar");

  if (!painel) return;

  // Botão voltar
  if (btnVoltar) {
    btnVoltar.addEventListener("click", (e) => {
      e.preventDefault();
      if (window.history.length > 1) window.history.back();
      else window.location.href = "index.html#filmes";
    });
  }

  // Aguarda filmes da API
  await window.VIOLET.carregarFilmes();

  // ---------- 1) Lê parâmetros da URL ----------
  const params = new URLSearchParams(window.location.search);
  const idUrl       = params.get("id");
  const sessaoIdUrl = Number(params.get("sessaoId"));
  const sessaoUrl   = params.get("sessao");
  const qtdUrl      = Number(params.get("quantidade")) || 1;
  const precoUrl    = Number(params.get("preco"));

  const filme = window.VIOLET?.buscarFilme(idUrl);

  // ---------- 2) Validação ----------
  if (!filme || !sessaoIdUrl || !sessaoUrl || !precoUrl) {
    painel.innerHTML = `
      <div class="erro">
        <h2>Nenhum pedido por aqui</h2>
        <p>Não encontramos o filme ou a sessão. Volte ao catálogo.</p>
        <a href="index.html#filmes" class="btn">
          <i data-lucide="arrow-left"></i> Voltar aos filmes
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const quantidade = Math.max(1, Math.min(10, qtdUrl));
  const PRECO = precoUrl;

  // ---------- 3) Calcula valores ----------
  const { subtotal, taxa, total } = window.VIOLET.calcularTotal(quantidade, PRECO);

  // ---------- 4) Renderiza o painel ----------
  painel.innerHTML = `
    <div class="painel">
      <div class="painel-header">
        <span class="painel-subtitulo">VIOLET+ CINEMA</span>
        <h1 class="painel-titulo">Pagamento</h1>
      </div>

      <div>
        <strong class="secao-titulo">
          <i data-lucide="ticket"></i>
          Seu pedido
        </strong>

        <div class="filme-escolhido">
          <img src="${filme.imagem}" alt="${filme.titulo}"
               onerror="this.src='https://via.placeholder.com/80x118/1a1225/c084fc?text=?'" />
          <div class="filme-escolhido-info">
            <small>VOCÊ ESTÁ COMPRANDO</small>
            <h3>${filme.titulo}</h3>
            <p><i data-lucide="clock"></i> ${sessaoUrl}</p>
            <p><i data-lucide="ticket"></i> ${quantidade} ${quantidade === 1 ? "ingresso" : "ingressos"}</p>
          </div>
        </div>

        <div class="resumo">
          <div class="resumo-linha">
            <span>Subtotal</span>
            <span>${window.VIOLET.dinheiro(subtotal)}</span>
          </div>
          <div class="resumo-linha">
            <span>Taxa</span>
            <span>${window.VIOLET.dinheiro(taxa)}</span>
          </div>
          <div class="resumo-total">
            <span class="label">TOTAL</span>
            <span class="valor">${window.VIOLET.dinheiro(total)}</span>
          </div>
        </div>
      </div>

      <div class="divisor"></div>

      <div>
        <strong class="secao-titulo">
          <i data-lucide="credit-card"></i>
          Forma de pagamento
        </strong>
        <p class="secao-desc">Escolha como deseja pagar.</p>

        <div class="opcoes" id="opcoes-pagamento">
          <button type="button" class="opcao" data-tipo="CartaoCredito">
            <div class="icone-opcao"><i data-lucide="credit-card"></i></div>
            <div class="texto-opcao">
              <strong>Cartão de Crédito</strong>
              <small>Pague em até 3x sem juros</small>
            </div>
            <span class="seletor"></span>
          </button>

          <button type="button" class="opcao" data-tipo="Pix">
            <div class="icone-opcao"><i data-lucide="qr-code"></i></div>
            <div class="texto-opcao">
              <strong>Pix</strong>
              <small>Aprovação imediata</small>
            </div>
            <span class="seletor"></span>
          </button>

          <button type="button" class="opcao" data-tipo="Boleto">
            <div class="icone-opcao"><i data-lucide="barcode"></i></div>
            <div class="texto-opcao">
              <strong>Boleto</strong>
              <small>Vencimento em 3 dias úteis</small>
            </div>
            <span class="seletor"></span>
          </button>
        </div>
      </div>

      <button class="cta" id="btn-pagar" disabled>
        Pagar ${window.VIOLET.dinheiro(total)}
        <i data-lucide="arrow-right"></i>
      </button>

      <div class="aviso-seguranca">
        <i data-lucide="shield-check"></i>
        Compra segura. Seus dados estão protegidos.
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // ---------- 5) Seleção de forma de pagamento ----------
  const opcoes = document.querySelectorAll(".opcao");
  const btnPagar = document.getElementById("btn-pagar");
  let formaEscolhida = null;

  opcoes.forEach((btn) => {
    btn.addEventListener("click", () => {
      opcoes.forEach((b) => b.classList.remove("selecionada"));
      btn.classList.add("selecionada");
      formaEscolhida = btn.dataset.tipo;
      btnPagar.disabled = false;
    });
  });

  // ---------- 6) Pagar → API + localStorage + sucesso ----------
  btnPagar.addEventListener("click", async () => {
    if (!formaEscolhida) return;

    // Desabilita o botão pra evitar duplo clique
    btnPagar.disabled = true;
    const textoOriginal = btnPagar.innerHTML;
    btnPagar.innerHTML = "Processando…";

    try {
      // === POST /api/venda ===
      const res = await fetch(`${window.VIOLET.API}/venda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessaoId: sessaoIdUrl,
          quantidadeIngressos: quantidade,
          tipoPagamento: formaEscolhida,
        }),
      });

      // Se o back retornou erro (400, 404, 500…)
      if (!res.ok) {
        let mensagem = "Não foi possível finalizar o pedido.";
        try {
          const corpo = await res.json();
          if (corpo?.message) mensagem = corpo.message;
        } catch {
          const texto = await res.text();
          if (texto) mensagem = texto;
        }
        alert(mensagem);
        btnPagar.disabled = false;
        btnPagar.innerHTML = textoOriginal;
        return;
      }

      // === Resposta da API (201 Created) ===
      // { vendaId, sessaoId, quantidade, tipoPagamento, total }
      const venda = await res.json();

      // === Salva no localStorage (histórico visual do carrinho) ===
      const CHAVE = "violet_carrinho";
      const carrinho = JSON.parse(localStorage.getItem(CHAVE) || "[]");

      const chaveItem = `${filme.id}::${sessaoUrl}`;
      const existente = carrinho.find(
        (i) => `${i.id}::${i.sessao || ""}` === chaveItem
      );

      if (existente) {
        existente.quantidade += venda.quantidade;
      } else {
        carrinho.push({
          id: filme.id,
          nome: filme.titulo,
          preco: PRECO,
          imagem: filme.imagem,
          sessao: sessaoUrl,
          quantidade: venda.quantidade,
          vendaId: venda.vendaId,
        });
      }

      localStorage.setItem(CHAVE, JSON.stringify(carrinho));

      // Avisa o badge do carrinho (se a função existir)
      if (window.atualizarBadgeCarrinho) window.atualizarBadgeCarrinho();

      // === Navega pra sucesso com os dados REAIS da venda ===
      window.location.href =
        `sucesso.html` +
        `?id=${encodeURIComponent(filme.id)}` +
        `&vendaId=${encodeURIComponent(venda.vendaId)}` +
        `&sessao=${encodeURIComponent(sessaoUrl)}` +
        `&quantidade=${encodeURIComponent(venda.quantidade)}` +
        `&total=${encodeURIComponent(venda.total)}` +
        `&pagamento=${encodeURIComponent(venda.tipoPagamento)}`;
    } catch (erro) {
      console.error("Erro ao finalizar venda:", erro);
      alert("Erro de conexão com a API. Verifique se o servidor está rodando.");
      btnPagar.disabled = false;
      btnPagar.innerHTML = textoOriginal;
    }
  });
});