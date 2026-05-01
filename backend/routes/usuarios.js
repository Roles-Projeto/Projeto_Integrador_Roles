const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

router.post("/cadastro", usuariosController.cadastrarUsuario);
router.post("/enviar-codigo", usuariosController.enviarCodigo);
router.post("/verificar-codigo", usuariosController.verificarCodigo);
router.get("/", usuariosController.listarUsuarios);
router.put("/perfil", usuariosController.atualizarUsuario);
router.get("/:id", usuariosController.buscarUsuarioPorId);

console.log("📡 ROTAS DE USUÁRIOS CARREGADAS");

module.exports = router;