

CREATE DATABASE IF NOT EXISTS backend2ds
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE backend2ds;



CREATE TABLE IF NOT EXISTS filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    genero VARCHAR(100) NOT NULL,
    duracao_minutos INT NOT NULL,
    preco_base DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    imagem VARCHAR(500) NULL,
    sinopse TEXT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_filme_duracao CHECK (duracao_minutos > 0),
    CONSTRAINT chk_filme_preco CHECK (preco_base >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_filmes_ativo ON filmes (ativo);



CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NOT NULL,
    sala VARCHAR(50) NOT NULL,
    data_hora DATETIME NOT NULL,
    total_assentos INT NOT NULL,
    assentos_disponiveis INT NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessao_filme
        FOREIGN KEY (filme_id) REFERENCES filmes(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_sessao_assentos
        CHECK (
            assentos_disponiveis >= 0
            AND assentos_disponiveis <= total_assentos
        ),

    CONSTRAINT chk_sessao_total CHECK (total_assentos > 0),
    CONSTRAINT chk_sessao_preco CHECK (preco >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_sessoes_filme ON sessoes (filme_id);
CREATE INDEX idx_sessoes_data_hora ON sessoes (data_hora);



CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,

    CONSTRAINT uq_usuario_email UNIQUE (email)
) ENGINE=InnoDB;



CREATE TABLE IF NOT EXISTS vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    sessao_id INT NOT NULL,
    quantidade_ingressos INT NOT NULL,
    tipo_pagamento VARCHAR(30) NOT NULL,
    status_pagamento VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_venda_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_venda_sessao
        FOREIGN KEY (sessao_id) REFERENCES sessoes(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_venda_qtd CHECK (quantidade_ingressos > 0),
    CONSTRAINT chk_venda_total CHECK (total >= 0),

    CONSTRAINT chk_venda_tipo
        CHECK (tipo_pagamento IN ('CartaoCredito', 'Pix', 'Boleto')),

    CONSTRAINT chk_venda_status_pag
        CHECK (status_pagamento IN ('Pendente', 'Aprovado', 'Recusado')),

    CONSTRAINT chk_venda_status
        CHECK (status IN ('Pendente', 'Paga', 'Cancelada'))
) ENGINE=InnoDB;

CREATE INDEX idx_vendas_usuario ON vendas (usuario_id);
CREATE INDEX idx_vendas_sessao ON vendas (sessao_id);
CREATE INDEX idx_vendas_criado ON vendas (criado_em);




INSERT INTO filmes
(nome, genero, duracao_minutos, preco_base, ativo, imagem, sinopse)
VALUES
('O Senhor dos Anéis', 'Fantasia', 178, 30.00, TRUE, '/imgs/senhor_dos_aneis.jpg',
'Em uma jornada épica pela Terra-média, Frodo precisa destruir um poderoso anel capaz de colocar todo o mundo sob o domínio das trevas.'),

('Avatar: O Caminho da Água', 'Ficção Científica', 192, 35.00, TRUE, '/imgs/avatar.jpg',
'Jake Sully e Neytiri vivem em Pandora com sua família, mas uma nova ameaça coloca em risco a paz e os habitantes do planeta.'),

('Interestelar', 'Ficção Científica', 169, 28.00, TRUE, '/imgs/interestelar.png',
'Um grupo de astronautas parte em uma missão espacial para encontrar um novo lar para a humanidade, enfrentando desafios que desafiam os limites do tempo e do espaço.'),

('Divertida Mente 2', 'Animação', 96, 22.00, TRUE, '/imgs/divertidamente2.jpg',
'Riley enfrenta novas emoções durante sua adolescência, enquanto Alegria, Tristeza e as demais emoções precisam aprender a lidar com as mudanças.'),

('Duna: Parte 2', 'Ficção Científica', 166, 32.00, TRUE, '/imgs/duna2.jpg',
'Paul Atreides se une aos Fremen em uma jornada de vingança e sobrevivência no perigoso planeta Arrakis.'),

('The Batman', 'Ação - Crime', 176, 30.00, TRUE, '/imgs/batman.jpg',
'Bruce Wayne investiga uma série de crimes em Gotham e descobre uma conspiração que ameaça revelar os segredos da cidade.'),

('Vingadores: Ultimato', 'Ação - Ficção Científica', 181, 35.00, TRUE, '/imgs/vingadores_ultimato.jpg',
'Os Vingadores enfrentam sua maior batalha para tentar reverter os efeitos de uma catástrofe que eliminou metade da vida no universo.'),

('Homem-Aranha: Através do Aranhaverso', 'Animação - Ação', 140, 28.00, TRUE, '/imgs/homem_aranha_aranhaverso.jpg',
'Miles Morales retorna ao Aranhaverso e encontra diferentes versões do Homem-Aranha enquanto enfrenta uma ameaça que pode alterar várias realidades.'),

('A Origem', 'Ficção Científica - Ação', 148, 29.00, TRUE, '/imgs/a_origem.jpg',
'Dom Cobb é um especialista em invadir sonhos e recebe uma missão desafiadora: implantar uma ideia na mente de uma pessoa sem que ela perceba.'),

('Super Mario Bros.', 'Animação', 92, 25.00, TRUE, '/imgs/mario.jpg',
'Mario e Luigi são transportados para um mundo fantástico, onde precisam enfrentar desafios e ajudar a princesa Peach a proteger seu reino.'),

('Homem-Aranha: Sem Volta para Casa', 'Ação - Aventura', 148, 30.00, TRUE, '/imgs/miranha_sem_casa.jpg',
'Peter Parker precisa lidar com as consequências de uma decisão que altera sua vida e abre caminho para encontros inesperados com outros heróis.'),

('Guardiões da Galáxia Vol. 3', 'Ação - Ficção Científica', 150, 30.00, TRUE, '/imgs/guardioes3.jpg',
'Os Guardiões da Galáxia embarcam em uma missão para proteger um de seus integrantes e enfrentar perigos que ameaçam toda a equipe.'),

('Barbie', 'Comédia - Fantasia', 114, 28.00, TRUE, '/imgs/barbie.jpg',
'Barbie vive no mundo da Barbielândia, mas uma mudança inesperada a leva a descobrir o mundo real e questionar sua própria existência.'),

('Oppenheimer', 'Drama - História', 180, 32.00, TRUE, '/imgs/oppenheimer.jpg',
'O físico J. Robert Oppenheimer lidera o desenvolvimento da primeira bomba atômica durante a Segunda Guerra Mundial e enfrenta as consequências de sua criação.'),

('Como Treinar o Seu Dragão', 'Animação - Aventura', 98, 25.00, TRUE, '/imgs/como_treinar_seu_dragao.jpg',
'Soluço, um jovem viking, desenvolve uma amizade inesperada com um dragão e começa a transformar a relação entre humanos e criaturas.'),

('Jurassic World', 'Aventura - Ficção Científica', 124, 28.00, TRUE, '/imgs/jurassic_world.jpg',
'Um parque temático com dinossauros geneticamente recriados se transforma em um cenário de perigo quando uma criatura escapa do controle.'),

('Jogos Vorazes', 'Ação - Ficção Científica', 142, 28.00, TRUE, '/imgs/jogos_vorazes.jpg',
'Em uma sociedade dividida em distritos, Katniss Everdeen é escolhida para participar de uma competição mortal transmitida para toda a população.'),

('Pantera Negra', 'Ação - Aventura', 134, 30.00, TRUE, '/imgs/pantera_negra.png',
'T’Challa retorna a Wakanda para assumir o trono e proteger seu povo diante de um adversário que ameaça o futuro do reino.');



INSERT INTO sessoes
(filme_id, sala, data_hora, total_assentos, assentos_disponiveis, preco)
VALUES
(1, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00'), 100, 100, 30.00),
(2, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00'), 100, 100, 35.00),
(3, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '18:00:00'), 120, 120, 28.00),
(4, 'Sala 3', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00'), 80, 80, 22.00),
(5, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), 90, 90, 32.00),
(6, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:00:00'), 150, 150, 30.00),
(7, 'Sala 3', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '21:00:00'), 100, 100, 35.00),
(8, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00'), 120, 120, 28.00),
(9, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00'), 90, 90, 29.00),
(10, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:00:00'), 100, 100, 25.00),
(11, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00'), 100, 100, 30.00),
(12, 'Sala 3', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '20:00:00'), 120, 120, 30.00),
(13, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '18:00:00'), 80, 80, 28.00),
(14, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00'), 90, 90, 32.00),
(15, 'Sala 3', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '21:00:00'), 150, 150, 28.00),
(16, 'Sala 1', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00'), 100, 100, 25.00),
(17, 'Sala 2', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 3 DAY), '19:00:00'), 120, 120, 28.00),
(18, 'Sala 3', TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00'), 90, 90, 30.00);


SELECT * FROM filmes;
SELECT * FROM sessoes;
SELECT * FROM usuarios;
SELECT * FROM vendas;

 ALTER TABLE filmes ADD COLUMN sinopse TEXT;
