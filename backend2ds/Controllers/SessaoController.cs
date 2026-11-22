using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using backend2ds.Models;
using backend2ds.DTOs;

namespace backend2ds.Controllers;


// SessaoController

[ApiController]
[Route("api/[controller]")]   
public class SessaoController : ControllerBase
{
    // injeção ASP.NET :)
    private readonly IConfiguration configuration;

    public SessaoController(IConfiguration configuration)
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

    
    // GET /api/sessao              -> todas as sessões
    // GET /api/sessao?filmeId=1    -> só as sessões do filme 1
  
    [HttpGet]
    public IActionResult Get([FromQuery] int? filmeId = null)
    {
        using var conn = AbrirConexao();

        // Se filmeId foi informado, filtra, senão, pega todas as sessoes
        // É o que permite o HTML de venda pedir só as sessões do filme escolhido, e a dashboard ver todas
        string sql = filmeId.HasValue
            ? "SELECT * FROM sessoes WHERE filme_id = @filmeId ORDER BY data_hora"
            : "SELECT * FROM sessoes ORDER BY data_hora";

        using var cmd = new MySqlCommand(sql, conn);

        // Só adiciona o parâmetro se o filmeId foi informado
        if (filmeId.HasValue)
            cmd.Parameters.AddWithValue("@filmeId", filmeId.Value);

        using var reader = cmd.ExecuteReader();

        var sessoes = new List<Sessao>();
        while (reader.Read())
        {
            // MontarSessao (método lá embaixo) cria o objeto 
            sessoes.Add(MontarSessao(reader));
        }

        return Ok(sessoes); 
    }

    //  -> busca UMA sessão pelo id

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        using var conn = AbrirConexao();
        using var cmd = new MySqlCommand("SELECT * FROM sessoes WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", id);

        using var reader = cmd.ExecuteReader();

        // Não achou -> 404
        if (!reader.Read()) return NotFound();

        return Ok(MontarSessao(reader));
    }

    // -> cadastra uma nova sessão
    // POST /api/sessao
    [HttpPost]
    public IActionResult Post(SessaoRequest request)
    {
        using var conn = AbrirConexao();

        string sql = """
            INSERT INTO sessoes (filme_id, sala, data_hora, total_assentos, assentos_disponiveis, preco)
            VALUES (@filmeId, @sala, @dataHora, @total, @total, @preco);
            SELECT LAST_INSERT_ID();
            """;

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@filmeId", request.FilmeId);
        cmd.Parameters.AddWithValue("@sala", request.Sala);
        cmd.Parameters.AddWithValue("@dataHora", request.DataHora);
        cmd.Parameters.AddWithValue("@total", request.TotalAssentos);
        cmd.Parameters.AddWithValue("@preco", request.Preco);

        int id = Convert.ToInt32(cmd.ExecuteScalar());

        var sessao = new Sessao(id, request.FilmeId, request.Sala, request.DataHora,
                                request.TotalAssentos, request.TotalAssentos, request.Preco);

        return CreatedAtAction(nameof(GetById), new { id = sessao.Id }, sessao);
    }
    
     //  edita uma sessão 
    [HttpPut("{id}")]
    public IActionResult Put(int id, SessaoRequest request)
    {
        using var conn = AbrirConexao();

        string sql = """
            UPDATE sessoes
            SET filme_id = @filmeId,
                sala = @sala,
                data_hora = @dataHora,
                total_assentos = @total,
                assentos_disponiveis = @total - (
                    SELECT COALESCE(SUM(quantidade_ingressos), 0)
                    FROM vendas WHERE sessao_id = @id
                ),
                preco = @preco
            WHERE id = @id;
            """;

        using var cmd = new MySqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("@filmeId", request.FilmeId);
        cmd.Parameters.AddWithValue("@sala", request.Sala);
        cmd.Parameters.AddWithValue("@dataHora", request.DataHora);
        cmd.Parameters.AddWithValue("@total", request.TotalAssentos);
        cmd.Parameters.AddWithValue("@preco", request.Preco);
        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();
        if (linhas == 0) return NotFound();   // sessão não existia

        return Ok();
    }
   
    //  excluir sessao
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        using var conn = AbrirConexao();

        // 1. cOnta se existem vendas para essa sessão
        using var cmdCheck = new MySqlCommand(
            "SELECT COUNT(*) FROM vendas WHERE sessao_id = @id", conn);
        cmdCheck.Parameters.AddWithValue("@id", id);
        long vendas = Convert.ToInt64(cmdCheck.ExecuteScalar());

        // Se tem venda bloqueia com HTTP 400
        if (vendas > 0)
            return BadRequest("Não é possível excluir: existem vendas para esta sessão.");

        // 2. Se não tem venda, pode apagar
        using var cmd = new MySqlCommand("DELETE FROM sessoes WHERE id = @id", conn);
        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();
        if (linhas == 0) return NotFound();

        return Ok();
    }

    // Método auxiliar: monta um objeto Sessao a partir de uma linha do reader 
    private static Sessao MontarSessao(MySqlDataReader r) => new(
        r.GetInt32("id"),
        r.GetInt32("filme_id"),
        r.GetString("sala"),
        r.GetDateTime("data_hora"),
        r.GetInt32("total_assentos"),
        r.GetInt32("assentos_disponiveis"),
        r.GetDecimal("preco")
    );
}