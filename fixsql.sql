SET NAMES utf8mb4;

UPDATE estabelecimentos SET 
  cidade='Aparecida de Goiânia',
  endereco='Rua Cruz Alta, 36 - Jardim Cristal, Aparecida de Goiânia - GO',
  horario='Segunda-feira: 08:00-22:00, Terça-feira: 08:00-22:00, Quarta-feira: 08:00-22:00, Quinta-feira: 08:00-22:00, Sexta-feira: 08:00-23:00, Sábado: 09:00-23:00'
WHERE id=1;

UPDATE eventos SET 
  assunto='Shows e Música',
  rua='Praça Roberto Gomes Pedrosa',
  cidade='São Paulo'
WHERE nome='BTS WORLD TOUR ARIRANG';

UPDATE avaliacoes SET comentario='o melhor da região' WHERE id=5;