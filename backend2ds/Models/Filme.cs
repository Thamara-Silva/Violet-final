
namespace backend2ds.Models;

public class Filme
{
    public int Id { get; private set; }
    public string Nome { get; private set; }
    public string Genero { get; private set; }
    public int DuracaoMinutos { get; private set; }
    public decimal PrecoBase { get; private set; }
    public bool Ativo { get; private set; }
    public string Imagem { get; private set; }
    public string Sinopse { get; private set; }

    public Filme(
        int id,
        string nome,
        string genero,
        int duracaoMinutos,
        decimal precoBase,
        bool ativo,
        string imagem,
        string sinopse)
    {
        Id = id;
        Nome = nome;
        Genero = genero;
        DuracaoMinutos = duracaoMinutos;
        PrecoBase = precoBase;
        Ativo = ativo;
        Imagem = imagem;
        Sinopse = sinopse;
    }
}
