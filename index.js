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

// 🔹 Limite de caracteres por trecho
const LIMITE = 500;

// 🔹 Função para dividir texto sem cortar palavras
function dividirTexto(texto, limite) {
  let partes = [];
  let inicio = 0;

  while (inicio < texto.length) {
    let fim = inicio + limite;
    if (fim >= texto.length) {
      partes.push(texto.slice(inicio));
      break;
    }

    let trecho = texto.slice(inicio, fim);
    let ultimoEspaco = trecho.lastIndexOf(" ");

    if (ultimoEspaco === -1) {
      // Palavra maior que limite, corta no limite mesmo
      ultimoEspaco = limite;
    }

    partes.push(texto.slice(inicio, inicio + ultimoEspaco));
    inicio += ultimoEspaco + 1; // pula o espaço
  }

  return partes;
}

// 🔹 POST: salvar texto no livro correto
app.post("/upload-text", async (req, res) => {
  const { texto, livroId } = req.body;

  if (!texto || !livroId) {
    return res.status(400).json({ status: "erro", mensagem: "Texto e livroId são obrigatórios" });
  }

  const tabela = `Livro-${livroId}`;
  const partes = dividirTexto(texto, LIMITE);

  try {
    for (let parte of partes) {
      const { error } = await supabase
        .from(tabela)
        .insert([{ status: false, Trecho: parte }]);
      if (error) throw error;
    }

    res.json({
      status: "ok",
      mensagem: `Texto salvo no ${tabela} em ${partes.length} parte(s)!`,
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
  console.log("👉 Texto será salvo no Supabase na tabela correspondente ao livro.");
});
