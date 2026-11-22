namespace backend2ds.Models;

public class Sessao
{
    public int Id { get; private set; }
    public int FilmeId { get; private set; }
    public string Sala { get; private set; }
    public DateTime DataHora { get; private set; }
    public int TotalAssentos { get; private set; }
    public int AssentosDisponiveis { get; private set; }
    public decimal Preco { get; private set; }

    public Sessao(
        int id,
        int filmeId,
        string sala,
        DateTime dataHora,
        int totalAssentos,
        int assentosDisponiveis,
        decimal preco)
    {
        Id = id;
        FilmeId = filmeId;
        Sala = sala;
        DataHora = dataHora;
        TotalAssentos = totalAssentos;
        AssentosDisponiveis = assentosDisponiveis;
        Preco = preco;
    }
}