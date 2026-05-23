const express = require("express");
const router = express.Router();
const planoQuinzenalController = require("../controllers/planoQuinzenalController");

// ============================================
// ROTAS PARA plano_quinzenal.html
// ============================================

// Dados iniciais (províncias, distritos, disciplinas)
router.get("/dados-iniciais", planoQuinzenalController.getDadosIniciais);

// Buscar distritos por província
router.post("/distritos", planoQuinzenalController.getDistritos);

// Buscar disciplinas por classe
router.post("/disciplinas", planoQuinzenalController.getDisciplinas);

// Buscar conteúdos da API do Google Apps Script
router.post("/buscar-conteudos", planoQuinzenalController.buscarConteudos);

// Gerar plano completo (HTML da tabela)
router.post("/gerar-plano", planoQuinzenalController.gerarPlano);

// Validar dados do formulário
router.post("/validar", planoQuinzenalController.validarDados);

// Buscar semanas disponíveis
router.get("/semanas", planoQuinzenalController.getSemanas);

module.exports = router;
