
import { Platform } from 'react-native';

// Endereço do computador que executa a API.
const IP =
  Platform.OS === 'android'
    ? '10.0.2.2'
    : 'localhost';

const BASE_URL = `http://${IP}:5000/api`;
const IMAGENS_URL = `http://${IP}:5000`;

// Transforma o caminho salvo no banco em uma URL acessível.
export function corrigirImagem(imagem: string | null | undefined) {
  if (!imagem) return '';

  // Se já for uma URL completa, mantém o endereço.
  if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
    return imagem;
  }

  // Garante que o caminho comece com /.
  const caminho = imagem.startsWith('/')
    ? imagem
    : `/imgs/${imagem}`;

  return `${IMAGENS_URL}${caminho}`;
}

export async function getFilmes() {
  try {
    const res = await fetch(`${BASE_URL}/filme`);

    if (!res.ok) {
      throw new Error('Erro ao buscar filmes');
    }

    const data = await res.json();

    // Corrige o endereço das imagens de cada filme.
    return data.map((filme: any) => ({
      ...filme,
      imagem: corrigirImagem(filme.imagem),
    }));

  } catch (error) {
    console.error('Erro na API:', error);
    return [];
  }
}

export async function getSessoes(filmeId: string | number) {
  try {
    const res = await fetch(
      `${BASE_URL}/sessao?filmeId=${filmeId}`
    );

    if (!res.ok) {
      throw new Error('Erro ao buscar sessões');
    }

    return await res.json();

  } catch (error) {
    console.error('Erro na API:', error);
    return [];
  }
}

export async function finalizarVenda(
  sessaoId: number,
  quantidade: number,
  tipoPagamento: string
) {
  try {
    const res = await fetch(`${BASE_URL}/venda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessaoId,
        quantidadeIngressos: quantidade,
        tipoPagamento,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.message || data || 'Erro ao finalizar compra'
      );
    }

    return data;

  } catch (error: any) {
    console.error('Erro ao finalizar venda:', error);

    throw new Error(
      error.message || 'Erro de conexão com a API'
    );
  }
}
