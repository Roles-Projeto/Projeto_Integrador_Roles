require("dotenv").config();
const nodemailer = require("nodemailer");

console.log("USER:", process.env.EMAIL_USER);
console.log("PASS existe?", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // envia pra si mesmo
  subject: "Teste Roles",
  html: "<h1>123456</h1>"
}, (err, info) => {
  if (err) {
    console.log("❌ ERRO:", err.message);
    console.log("   Código:", err.code); // EAUTH = senha errada
  } else {
    console.log("✅ EMAIL ENVIADO:", info.response);
  }
});