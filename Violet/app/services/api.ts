import { Platform } from 'react-native';


const IP = Platform.OS === 'android' ? ' 192.168.0.1' : 'localhost'; 
const BASE_URL = `http://${IP}:5000/api`;

export async function getFilmes() {
  try {
    const res = await fetch(`${BASE_URL}/filme`);
    if (!res.ok) throw new Error('Erro ao buscar filmes');
    return await res.json();
  } catch (error) {
    console.error("Erro na API:", error);
    return [];
  }
}

export async function getSessoes(filmeId: string | number) {
  try {
    const res = await fetch(`${BASE_URL}/sessao?filmeId=${filmeId}`);
    if (!res.ok) throw new Error('Erro ao buscar sessões');
    return await res.json();
  } catch (error) {
    console.error("Erro na API:", error);
    return [];
  }
}

export async function finalizarVenda(sessaoId: number, quantidade: number, tipoPagamento: string) {
  try {
    const res = await fetch(`${BASE_URL}/venda`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessaoId,
        quantidadeIngressos: quantidade,
        tipoPagamento, // "Pix", "CartaoCredito", "Boleto"
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || data || 'Erro ao finalizar compra');
    
    return data; // Retorna { vendaId, total, ... }
  } catch (error: any) {
    console.error("Erro ao finalizar venda:", error);
    throw new Error(error.message || 'Erro de conexão com a API');
  }
}