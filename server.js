const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({ 
  origin: ["https://seu-app.firebaseapp.com", "https://seu-app.web.app", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// ============================================
// ROTAS
// ============================================
const planoQuinzenalRoutes = require("./routes/planoQuinzenalRoutes");
const gratisunluckQuinzenalRoutes = require("./routes/gratisunluckQuinzenalRoutes");

app.use("/api/plano-quinzenal", planoQuinzenalRoutes);
app.use("/api/gratisunluck", gratisunluckQuinzenalRoutes);

// ============================================
// TESTE
// ============================================
app.get("/api/status", (req, res) => {
  res.json({ success: true, message: "✅ Servidor online!" });
});

app.get("/", (req, res) => {
  res.json({ 
    message: "API do Sistema de Planos Quinzenais",
    status: "online",
    endpoints: {
      planoQuinzenal: "/api/plano-quinzenal/*",
      gratisunluck: "/api/gratisunluck/*"
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
