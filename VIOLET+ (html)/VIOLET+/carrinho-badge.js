/* ============================================
   VIOLET+ — BADGE DE QUANTIDADE NO CARRINHO
   Atualiza o número em cima do ícone do
   carrinho no bottom-nav em QUALQUER página.
   ============================================ */

(function () {
  const CHAVE_CARRINHO = "violet_carrinho";

  function contarItens() {
    try {
      const carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");
      // Soma as quantidades (2x Doutor Estranho + 1x M3GAN = 3)
// Junta os valores dos itens para obter um total.
      return carrinho.reduce((soma, item) => soma + (item.quantidade || 0), 0);
    } catch {
      return 0;
    }
  }

  function atualizarBadge() {
    // Procura o <a> que aponta para carrinho.html no bottom-nav
    const linkCarrinho = document.querySelector('.bottom-nav a[href="carrinho.html"]');
    if (!linkCarrinho) return;

    const total = contarItens();

    // Remove badge antigo, se existir
    const antigo = linkCarrinho.querySelector(".badge-carrinho");
    if (antigo) antigo.remove();

    // Se não tem itens, não mostra badge
    if (total === 0) return;

    // Cria badge novo
    const badge = document.createElement("span");
    badge.className = "badge-carrinho";
    badge.textContent = total > 99 ? "99+" : String(total);
    linkCarrinho.appendChild(badge);
  }

  // Roda quando o DOM estiver pronto
  document.addEventListener("DOMContentLoaded", atualizarBadge);

  // Roda também se o localStorage mudar em OUTRA aba
  window.addEventListener("storage", (e) => {
    if (e.key === CHAVE_CARRINHO) atualizarBadge();
  });

  // Expõe globalmente para o pagamento/carrinho avisar
  window.atualizarBadgeCarrinho = atualizarBadge;
})();
