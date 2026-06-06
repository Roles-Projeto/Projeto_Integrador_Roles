const express        = require("express");
const router         = express.Router();
const authController = require("../controllers/authController");

router.post("/login",                      authController.loginUsuario);
router.get("/historico-acessos/:id",       authController.historicoAcessos);

module.exports = router;