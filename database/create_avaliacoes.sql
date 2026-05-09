-- Execute isso no seu MySQL (pode rodar direto no terminal do Docker)
-- docker exec -it <nome_container_mysql> mysql -u root -p roles_db

CREATE TABLE IF NOT EXISTS avaliacoes (
    id              INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
    estabelecimento_id INT        NOT NULL,
    usuario_id      INT           NULL,                  -- NULL = anônimo
    nome_autor      VARCHAR(100)  NOT NULL DEFAULT 'Anônimo',
    nota            TINYINT       NOT NULL CHECK (nota BETWEEN 1 AND 5),
    texto           TEXT          NULL,
    criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (estabelecimento_id) REFERENCES estabelecimentos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id)         REFERENCES usuarios(id)         ON DELETE SET NULL
);