const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/usuarios/login", authController.loginUsuario);
router.post("/empresarios/login", authController.loginEmpresario);

module.exports = router;
