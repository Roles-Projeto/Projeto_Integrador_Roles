const express = require('express');
const cors = require('cors');
const contatoRoutes = require('./routes/contato.js');

const app = express();

app.use(cors());
app.use(express.json());

// rota principal de contato
app.use('/api/contato', contatoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

