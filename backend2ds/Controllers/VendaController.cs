using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using backend2ds.Models;
using backend2ds.DTOs;

namespace backend2ds.Controllers;

// VendaController

[ApiController]
[Route("api/[controller]")]   
public class VendaController : ControllerBase
{
    private readonly IConfiguration configuration;

    public VendaController(IConfiguration configuration)
    {
        this.configuration = configuration;
    }

    private MySqlConnection AbrirConexao()
    {
        var cs = configuration.GetConnectionString("DefaultConnection")!;
        var conn = new MySqlConnection(cs);
        conn.Open();
        return conn;
    }

    // -> lista todas as vendas (usado pela dashboard)
    [HttpGet]
    public IActionResult Get()
    {
        using var conn = AbrirConexao();

        string sql = """
            SELECT v.id, v.sessao_id, v.quantidade_ingressos,
                   v.tipo_pagamento, v.total, v.criado_em,
                   s.sala, s.data_hora, s.preco,
                   f.nome AS filme_nome
            FROM vendas v
            INNER JOIN sessoes s ON s.id = v.sessao_id
            INNER JOIN filmes  f ON f.id = s.filme_id
            ORDER BY v.id DESC
            """;

        using var cmd = new MySqlCommand(sql, conn);
        using var reader = cmd.ExecuteReader();

        var lista = new List<object>();

        while (reader.Read())
        {
            lista.Add(new
            {
                id = reader.GetInt32("id"),
                sessaoId = reader.GetInt32("sessao_id"),
                filmeNome = reader.GetString("filme_nome"),
                sala = reader.GetString("sala"),
                dataHora = reader.GetDateTime("data_hora"),
                quantidadeIngressos = reader.GetInt32("quantidade_ingressos"),
                tipoPagamento = reader.GetString("tipo_pagamento"),
                total = reader.GetDecimal("total"),
                criadoEm = reader.GetDateTime("criado_em")
            });
        }

        return Ok(lista);
    }

    // finaliza a compra
    [HttpPost]
    public IActionResult Post(VendaRequest request)
    {
        // 1. Quantidade tem que ser positiva
        if (request.QuantidadeIngressos <= 0)
            return BadRequest("Quantidade de ingressos deve ser maior que zero.");

        // 2. Tipo de pagamento tem que ser um dos válidos
        if (request.TipoPagamento is not ("CartaoCredito" or "Pix" or "Boleto"))
            return BadRequest("Tipo de pagamento inválido.");

        using var conn = AbrirConexao();
        using var transacao = conn.BeginTransaction();

        try
        {
            // Trava a linha da sessão para evitar concorrência de assentos
            string sqlSessao = "SELECT preco, assentos_disponiveis FROM sessoes WHERE id = @id FOR UPDATE";
            using var cmdSessao = new MySqlCommand(sqlSessao, conn, transacao);
            cmdSessao.Parameters.AddWithValue("@id", request.SessaoId);

            using var reader = cmdSessao.ExecuteReader();

            if (!reader.Read())
                return NotFound("Sessão não encontrada.");

            decimal preco = reader.GetDecimal("preco");
            int disponiveis = reader.GetInt32("assentos_disponiveis");

            reader.Close();

            // Valida se tem assento suficiente
            if (disponiveis < request.QuantidadeIngressos)
                return BadRequest($"Assentos insuficientes. Disponíveis: {disponiveis}.");

            // Calcula o total
            decimal total = preco * request.QuantidadeIngressos;

            // Insere a venda passando usuario_id como NULL (já que o sistema não tem login obrigatório)
            string sqlVenda = """
                INSERT INTO vendas (usuario_id, sessao_id, quantidade_ingressos, tipo_pagamento, total)
                VALUES (NULL, @sessaoId, @qtd, @pagamento, @total);
                SELECT LAST_INSERT_ID();
                """;

            using var cmdVenda = new MySqlCommand(sqlVenda, conn, transacao);
            cmdVenda.Parameters.AddWithValue("@sessaoId", request.SessaoId);
            cmdVenda.Parameters.AddWithValue("@qtd", request.QuantidadeIngressos);
            cmdVenda.Parameters.AddWithValue("@pagamento", request.TipoPagamento);
            cmdVenda.Parameters.AddWithValue("@total", total);

            int vendaId = Convert.ToInt32(cmdVenda.ExecuteScalar());

            // Decrementa os assentos da sessão
            string sqlAtualiza = """
                UPDATE sessoes
                SET assentos_disponiveis = assentos_disponiveis - @qtd
                WHERE id = @id
                """;

            using var cmdAtualiza = new MySqlCommand(sqlAtualiza, conn, transacao);
            cmdAtualiza.Parameters.AddWithValue("@qtd", request.QuantidadeIngressos);
            cmdAtualiza.Parameters.AddWithValue("@id", request.SessaoId);
            cmdAtualiza.ExecuteNonQuery();

            transacao.Commit();

            return Created("", new
            {
                vendaId,
                sessaoId = request.SessaoId,
                quantidade = request.QuantidadeIngressos,
                tipoPagamento = request.TipoPagamento,
                total
            });
        }
        catch
        {
            transacao.Rollback();
            throw;
        }
    }
}