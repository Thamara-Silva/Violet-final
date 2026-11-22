namespace backend2ds.DTOs;

public record VendaRequest(
    int SessaoId,
    int QuantidadeIngressos,
    string TipoPagamento
);