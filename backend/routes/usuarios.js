const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

router.post("/cadastro", usuariosController.cadastrarUsuario);
router.get("/", usuariosController.listarUsuarios);
router.put("/perfil", usuariosController.atualizarUsuario);
// rota para pegar dados de um usuário específico pelo ID
router.get("/:id", usuariosController.buscarUsuarioPorId);


module.exports = router;
