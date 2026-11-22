namespace backend2ds.DTOs;

public record SessaoRequest(
    int FilmeId,
    string Sala,
    DateTime DataHora,
    int TotalAssentos,
    decimal Preco
);