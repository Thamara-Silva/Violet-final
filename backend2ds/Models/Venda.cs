namespace backend2ds.Models;

public class Venda
{
    public int Id { get; private set; }
    public int SessaoId { get; private set; }
    public int QuantidadeIngressos { get; private set; }
    public string TipoPagamento { get; private set; }
    public decimal Total { get; private set; }
    public DateTime CriadoEm { get; private set; }

    public Venda(
        int id,
        int sessaoId,
        int quantidadeIngressos,
        string tipoPagamento,
        decimal total,
        DateTime criadoEm)
    {
        Id = id;
        SessaoId = sessaoId;
        QuantidadeIngressos = quantidadeIngressos;
        TipoPagamento = tipoPagamento;
        Total = total;
        CriadoEm = criadoEm;
    }
}