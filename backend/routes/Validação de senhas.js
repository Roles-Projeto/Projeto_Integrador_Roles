

// Validação de força da senha
function validarSenha(senha) {
    const regra = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regra.test(senha);
}

// Criptografar senha
async function criarHashSenha(senha) {
    const senhaHash = await bcrypt.hash(senha, 10)
    return senhaHash
}

// Verificar senha no login
async function verificarSenha(senhaDigitada, senhaBanco) {
    const senhaCorreta = await bcrypt.compare(senhaDigitada, senhaBanco)
    return senhaCorreta
}

module.exports = {
    validarSenha,
    criarHashSenha,
    verificarSenha
}
