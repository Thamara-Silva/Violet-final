/* ============================================
   VIOLET+ — CONFIRMAÇÃO DE PEDIDO
   Lê ?id=, ?vendaId=, ?sessao=, ?quantidade=, ?total=, ?pagamento=
   Mostra o resumo da venda registrada no banco.
   ============================================ */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("conteudo-sucesso");
  if (!container) return;

  await window.VIOLET.carregarFilmes();

  const params = new URLSearchParams(window.location.search);
  const idUrl       = params.get("id");
  const vendaId     = params.get("vendaId");
  const sessaoUrl   = params.get("sessao");
  const qtdParam    = Number(params.get("quantidade")) || 1;
  const totalParam  = Number(params.get("total"));
  const pagamento   = params.get("pagamento");

  const filme = window.VIOLET?.buscarFilme(idUrl);

  if (!filme || !sessaoUrl || !vendaId) {
    container.innerHTML = `
      <div class="erro">
        <h2>Nenhum pedido por aqui</h2>
        <p>Não encontramos o pedido. Volte ao catálogo para começar de novo.</p>
        <a href="index.html#filmes" class="btn">
          <i data-lucide="arrow-left"></i> Voltar aos filmes
        </a>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const quantidade = Math.max(1, Math.min(10, qtdParam));
  const total = isNaN(totalParam) ? null : totalParam;

  // Rótulo amigável do pagamento
  const labelPagamento =
    pagamento === "CartaoCredito" ? "Cartão de Crédito" :
    pagamento === "Pix"           ? "Pix"              :
    pagamento === "Boleto"        ? "Boleto"           : pagamento;

  container.innerHTML = `
    <article class="sucesso-card">
      <div class="check-circulo">
        <i data-lucide="check"></i>
      </div>

      <span class="sucesso-subtitulo">PAGAMENTO APROVADO</span>

      <h1 class="sucesso-titulo">Pedido confirmado!</h1>

      <p class="sucesso-descricao">
        Seus ingressos já estão reservados.
        Você pode revisar tudo no carrinho quando quiser.
      </p>

      <div class="sucesso-resumo">
        <div class="sucesso-linha">
          <span>Pedido</span>
          <span>#${vendaId}</span>
        </div>
        <div class="sucesso-linha">
          <span>Filme</span>
          <span>${filme.titulo}</span>
        </div>
        <div class="sucesso-linha">
          <span>Sessão</span>
          <span>${sessaoUrl}</span>
        </div>
        <div class="sucesso-linha">
          <span>Ingressos</span>
          <span>${quantidade} ${quantidade === 1 ? "unidade" : "unidades"}</span>
        </div>
        <div class="sucesso-linha">
          <span>Pagamento</span>
          <span>${labelPagamento}</span>
        </div>
        ${total != null ? `
        <div class="sucesso-linha total">
          <span>Total pago</span>
          <span>${window.VIOLET.dinheiro(total)}</span>
        </div>` : ""}
      </div>

      <div class="sucesso-acoes">
        <a href="carrinho.html" class="sucesso-btn primario">
          Ver meu carrinho
          <i data-lucide="shopping-cart"></i>
        </a>
        <a href="index.html#filmes" class="sucesso-btn secundario">
          <i data-lucide="clapperboard"></i>
          Continuar explorando
        </a>
      </div>
    </article>
  `;

  if (window.lucide) lucide.createIcons();
});