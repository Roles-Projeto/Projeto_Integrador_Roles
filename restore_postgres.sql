-- =====================================================
--  ROLÊS — Restore PostgreSQL (convertido do MySQL)
-- =====================================================

-- AVALIACOES
DROP TABLE IF EXISTS avaliacoes CASCADE;
CREATE TABLE avaliacoes (
  id SERIAL PRIMARY KEY,
  estabelecimento_id INT,
  usuario_id INT,
  nota INT,
  comentario TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ESTABELECIMENTOS
DROP TABLE IF EXISTS estabelecimentos CASCADE;
CREATE TABLE estabelecimentos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  tipo VARCHAR(100),
  especialidade VARCHAR(100),
  faixa_preco VARCHAR(50),
  capacidade INT,
  descricao TEXT,
  logo TEXT,
  capa TEXT,
  galeria TEXT,
  horarios TEXT,
  cep VARCHAR(20),
  rua VARCHAR(150),
  numero VARCHAR(20),
  complemento VARCHAR(100),
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  telefone VARCHAR(20),
  website VARCHAR(255),
  owner_name VARCHAR(150),
  cnpj VARCHAR(20),
  visibilidade VARCHAR(20) DEFAULT 'publico',
  usuario_id INT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  avaliacao_media NUMERIC(3,1) DEFAULT 0,
  total_avaliacoes INT DEFAULT 0,
  categoria VARCHAR(100),
  comodidades TEXT,
  pratos TEXT
);

-- EVENTOS
DROP TABLE IF EXISTS eventos CASCADE;
CREATE TABLE eventos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  assunto VARCHAR(150),
  categoria VARCHAR(100),
  imagem TEXT,
  data_inicio TIMESTAMP NOT NULL,
  data_fim TIMESTAMP NOT NULL,
  descricao TEXT,
  local_nome VARCHAR(150),
  cep VARCHAR(20),
  rua VARCHAR(150),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  nome_produtor VARCHAR(150),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  criador_id INT
);

-- INGRESSOS
DROP TABLE IF EXISTS ingressos CASCADE;
CREATE TABLE ingressos (
  id SERIAL PRIMARY KEY,
  evento_id INT NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  titulo VARCHAR(150) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('gratuito','pago')),
  valor NUMERIC(10,2) DEFAULT 0.00,
  quantidade_total INT DEFAULT 1
);

-- USUARIOS
DROP TABLE IF EXISTS usuarios CASCADE;
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nome_completo VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  senha VARCHAR(255) NOT NULL,
  foto_perfil VARCHAR(255),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  codigo_verificacao VARCHAR(10),
  verificado SMALLINT DEFAULT 0,
  codigo_recuperacao VARCHAR(10),
  codigo_expira_em TIMESTAMP
);

-- =====================================================
-- DADOS
-- =====================================================

-- EVENTOS
INSERT INTO eventos (id, nome, assunto, categoria, imagem, data_inicio, data_fim, descricao, local_nome, cep, rua, cidade, estado, nome_produtor, criado_em) VALUES
(1,'BTS WORLD TOUR ARIRANG','Shows e Música','K-pop','/uploads/1778419529016.gif','2026-10-31 20:00:00','2026-10-31 23:59:00','O Maior Comback!','Morumbi','05653-070','Praça Roberto Gomes Pedrosa','São Paulo','SP','tiketmaster','2026-05-10 13:25:29'),
(8,'Pecuária de Goiânia','Shows e Música','Sertanejo','/uploads/1778679160736.png','2026-05-15 00:00:00','2026-05-25 05:59:00','A Pecuária de Goiânia espera você, sua família e seus amigos para curtimos juntos com segurança, tecnologia, e solidariedade!','St. Nova Vila','74653-200','Rua 250','Goiânia','GO','Pecuária de Goiânia','2026-05-13 13:32:40');

-- Atualiza sequence
SELECT setval('eventos_id_seq', (SELECT MAX(id) FROM eventos));

-- INGRESSOS
INSERT INTO ingressos (id, evento_id, titulo, tipo, valor, quantidade_total) VALUES
(1,1,'meia-entrada','pago',320.00,2000),
(2,1,'inteira - arquibancada','pago',690.00,23000),
(7,8,'Gratuito + 1kg de alimento','gratuito',0.00,2000000);

SELECT setval('ingressos_id_seq', (SELECT MAX(id) FROM ingressos));

-- USUARIOS
INSERT INTO usuarios (id, nome_completo, email, telefone, senha, foto_perfil, criado_em, codigo_verificacao, verificado, codigo_recuperacao, codigo_expira_em) VALUES
(1,'Thalia Andrade','thalia_andrade_santana@hotmail.com','62983197056','$2b$10$g4r0nzzF81Pg4L7MKShMWuzlYPHR14TL00kY41l3YknVwuNWhm1qS',NULL,'2026-05-09 22:53:06',NULL,1,NULL,NULL);

SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));
