const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login do usuário (único tipo de conta)
router.post("/login", authController.loginUsuario);

module.exports = router;