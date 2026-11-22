namespace backend2ds.DTOs;
public record FilmeRequest(
    string Nome,
    string Genero,
    int DuracaoMinutos,
    decimal PrecoBase,
    bool Ativo,
    string Imagem,
    string Sinopse
);