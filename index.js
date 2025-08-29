const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

// 🔹 Configurações Express
app.use(cors());
app.use(express.text({ limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));

// 🔹 Supabase
const SUPABASE_URL = "https://hvbvembchrfhrmoasokm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2YnZlbWJjaHJmaHJtb2Fzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMTc4MTUsImV4cCI6MjA3MTg5MzgxNX0.4ADUxmO7hM24CCWDYnYhmptPvI25P9XRgN5H7xg8SGc"; // Substitua pela sua anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const NOME_TABELA = "Textos";
const LIMITE = 500;

// 🔹 Função para dividir texto em partes
function dividirTexto(texto, limite) {
  let partes = [];
  for (let i = 0; i < texto.length; i += limite) {
    partes.push(texto.slice(i, i + limite));
  }
  return partes;
}

// 🔹 POST: salvar texto
app.post("/upload-text", async (req, res) => {
  const texto = req.body;
  console.log("Recebido do front-end:", texto.slice(0, 50) + "..."); // log parcial

  try {
    const partes = dividirTexto(texto, LIMITE);

    for (let i = 0; i < partes.length; i++) {
      const { error } = await supabase
        .from(NOME_TABELA)
        .insert([{ texto: partes[i], status: "ok" }]);
      if (error) throw error;
    }

    res.json({
      status: "ok",
      mensagem: `Texto salvo no Supabase em ${partes.length} parte(s)!`,
      partes: partes.length,
    });
  } catch (err) {
    console.error("Erro Supabase:", err);
    res.status(500).json({ status: "erro", mensagem: "Falha ao salvar no Supabase" });
  }
});

// 🔹 Inicia servidor
app.listen(3000, () => {
  console.log("✅ Servidor rodando em: http://localhost:3000");
  console.log("👉 Texto será salvo no Supabase na tabela:", NOME_TABELA);
});
