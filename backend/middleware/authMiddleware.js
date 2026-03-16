const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ mensagem: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      return res.status(401).json({ mensagem: "Token inválido" });
    }

    req.userId = decoded.id;

    next();
  });

}

module.exports = verificarToken;