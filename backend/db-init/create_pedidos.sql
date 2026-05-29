CREATE TABLE IF NOT EXISTS pedidos (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       INT            NOT NULL,
    evento_id        INT            NOT NULL,
    valor_total      DECIMAL(10,2)  NOT NULL,
    forma_pagamento  ENUM('credito','debito','boleto','pix') NOT NULL,
    status           ENUM('pendente','aprovado','recusado','cancelado') DEFAULT 'pendente',
    criado_em        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tipos_ingresso (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    evento_id           INT            NOT NULL,
    nome                VARCHAR(100)   NOT NULL,
    descricao           VARCHAR(255),
    preco               DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    quantidade_total    INT            NOT NULL,
    quantidade_vendida  INT            DEFAULT 0,
    ativo               TINYINT(1)     DEFAULT 1,
    criado_em           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);docker-compose up --build