UPDATE estabelecimentos
SET
  nome = 'Hamburgão',
  descricao = 'O melhor da região.',
  cidade = 'Aparecida de Goiânia',
  rua = 'Rua Cruz Alta',
  endereco = 'Rua Cruz Alta, 36 - Jardim Cristal, Aparecida de Goiânia - GO',
  horario = 'Segunda-feira: 08:00-22:00, Terça-feira: 08:00-22:00, Quarta-feira: 08:00-22:00, Quinta-feira: 08:00-22:00, Sexta-feira: 08:00-23:00, Sábado: 09:00-23:00'
WHERE id = 1;

UPDATE estabelecimentos
SET
  cidade = 'Aparecida de Goiânia',
  rua = 'Rua Bougainvílias',
  endereco = 'Rua Bougainvílias - Expansul, Aparecida de Goiânia - GO',
  horario = 'Quarta-feira: 18:45-22:30, Quinta-feira: 18:45-22:30, Sexta-feira: 18:45-22:30, Sábado: 18:45-22:30, Domingo: 18:45-22:30'
WHERE id = 2;