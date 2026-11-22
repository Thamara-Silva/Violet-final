
using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using backend2ds.Models;
using backend2ds.DTOs;

namespace backend2ds.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilmeController : ControllerBase
{
    private readonly IConfiguration configuration;

    public FilmeController(IConfiguration configuration)
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

    // GET /api/filme
    [HttpGet]
    public IActionResult Get([FromQuery] bool todos = false)
    {
        using var conn = AbrirConexao();

        string sql = todos
            ? "SELECT * FROM filmes ORDER BY id"
            : "SELECT * FROM filmes WHERE ativo = TRUE ORDER BY id";

        using var cmd = new MySqlCommand(sql, conn);
        using var reader = cmd.ExecuteReader();

        var filmes = new List<Filme>();

        while (reader.Read())
        {
            filmes.Add(new Filme(
                reader.GetInt32("id"),
                reader.GetString("nome"),
                reader.GetString("genero"),
                reader.GetInt32("duracao_minutos"),
                reader.GetDecimal("preco_base"),
                reader.GetBoolean("ativo"),
                reader.IsDBNull(reader.GetOrdinal("imagem"))
                    ? ""
                    : reader.GetString("imagem"),
                reader.IsDBNull(reader.GetOrdinal("sinopse"))
                    ? ""
                    : reader.GetString("sinopse")
            ));
        }

        return Ok(filmes);
    }

    // GET /api/filme/{id}
    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        using var conn = AbrirConexao();

        using var cmd = new MySqlCommand(
            "SELECT * FROM filmes WHERE id = @id", conn);

        cmd.Parameters.AddWithValue("@id", id);

        using var reader = cmd.ExecuteReader();

        if (!reader.Read()) return NotFound();

        var filme = new Filme(
            reader.GetInt32("id"),
            reader.GetString("nome"),
            reader.GetString("genero"),
            reader.GetInt32("duracao_minutos"),
            reader.GetDecimal("preco_base"),
            reader.GetBoolean("ativo"),
            reader.IsDBNull(reader.GetOrdinal("imagem"))
                ? ""
                : reader.GetString("imagem"),
            reader.IsDBNull(reader.GetOrdinal("sinopse"))
                ? ""
                : reader.GetString("sinopse")
        );

        return Ok(filme);
    }

    // POST /api/filme
    [HttpPost]
    public IActionResult Post(FilmeRequest request)
    {
        using var conn = AbrirConexao();

        string sql = """
            INSERT INTO filmes
            (nome, genero, duracao_minutos, preco_base, ativo, imagem, sinopse)
            VALUES
            (@nome, @genero, @duracao, @preco, @ativo, @imagem, @sinopse);

            SELECT LAST_INSERT_ID();
            """;

        using var cmd = new MySqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@nome", request.Nome);
        cmd.Parameters.AddWithValue("@genero", request.Genero);
        cmd.Parameters.AddWithValue("@duracao", request.DuracaoMinutos);
        cmd.Parameters.AddWithValue("@preco", request.PrecoBase);
        cmd.Parameters.AddWithValue("@ativo", request.Ativo);
        cmd.Parameters.AddWithValue("@imagem", request.Imagem);
        cmd.Parameters.AddWithValue("@sinopse", request.Sinopse);

        int id = Convert.ToInt32(cmd.ExecuteScalar());

        var filme = new Filme(
            id,
            request.Nome,
            request.Genero,
            request.DuracaoMinutos,
            request.PrecoBase,
            request.Ativo,
            request.Imagem,
            request.Sinopse
        );

        return CreatedAtAction(nameof(GetById), new { id = filme.Id }, filme);
    }

    // PUT /api/filme/{id}
    [HttpPut("{id}")]
    public IActionResult Put(int id, FilmeRequest request)
    {
        using var conn = AbrirConexao();

        string sql = """
            UPDATE filmes
            SET nome = @nome,
                genero = @genero,
                duracao_minutos = @duracao,
                preco_base = @preco,
                ativo = @ativo,
                imagem = @imagem,
                sinopse = @sinopse
            WHERE id = @id;
            """;

        using var cmd = new MySqlCommand(sql, conn);

        cmd.Parameters.AddWithValue("@nome", request.Nome);
        cmd.Parameters.AddWithValue("@genero", request.Genero);
        cmd.Parameters.AddWithValue("@duracao", request.DuracaoMinutos);
        cmd.Parameters.AddWithValue("@preco", request.PrecoBase);
        cmd.Parameters.AddWithValue("@ativo", request.Ativo);
        cmd.Parameters.AddWithValue("@imagem", request.Imagem);
        cmd.Parameters.AddWithValue("@sinopse", request.Sinopse);
        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();

        if (linhas == 0) return NotFound();

        return Ok();
    }

    // PATCH /api/filme/{id}/desativar
    [HttpPatch("{id}/desativar")]
    public IActionResult Desativar(int id)
    {
        using var conn = AbrirConexao();

        using var cmd = new MySqlCommand(
            "UPDATE filmes SET ativo = FALSE WHERE id = @id", conn);

        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();

        if (linhas == 0) return NotFound();

        return Ok();
    }

    // PATCH /api/filme/{id}/ativar
    [HttpPatch("{id}/ativar")]
    public IActionResult Ativar(int id)
    {
        using var conn = AbrirConexao();

        using var cmd = new MySqlCommand(
            "UPDATE filmes SET ativo = TRUE WHERE id = @id", conn);

        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();

        if (linhas == 0) return NotFound();

        return Ok();
    }

    // DELETE /api/filme/{id}
    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        using var conn = AbrirConexao();

        string sqlCheck = """
            SELECT COUNT(*)
            FROM vendas v
            INNER JOIN sessoes s ON s.id = v.sessao_id
            WHERE s.filme_id = @id
            """;

        using var cmdCheck = new MySqlCommand(sqlCheck, conn);

        cmdCheck.Parameters.AddWithValue("@id", id);

        long vendas = Convert.ToInt64(cmdCheck.ExecuteScalar());

        if (vendas > 0)
            return BadRequest(
                "Não é possível excluir: existem vendas ligadas a este filme. Use 'desativar'.");

        using var cmd = new MySqlCommand(
            "DELETE FROM filmes WHERE id = @id", conn);

        cmd.Parameters.AddWithValue("@id", id);

        int linhas = cmd.ExecuteNonQuery();

        if (linhas == 0) return NotFound();

        return Ok();
    }
}
