const express = require("express");
const router = express.Router();
const gratisunluckQuinzenalController = require("../controllers/gratisunluckQuinzenalController");

// Rotas para página gratisunluckquinzenal.html
router.post("/gerar-pdf", gratisunluckQuinzenalController.gerarPDF);
router.post("/consumir-credito", gratisunluckQuinzenalController.consumirCredito);
router.post("/validar-codigo", gratisunluckQuinzenalController.validarCodigo);
router.post("/verificar-creditos", gratisunluckQuinzenalController.verificarCreditos);

module.exports = router;
