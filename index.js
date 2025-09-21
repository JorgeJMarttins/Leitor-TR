<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Touch Read</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background: radial-gradient(circle at top, #1e293b, #0f172a);
      font-family: "Segoe UI", Tahoma, sans-serif;
      color: #f1f5f9;
    }

    .card {
      background: #1e293b;
      padding: 28px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      gap: 18px;
      width: 320px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.45);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 28px rgba(0,0,0,0.55);
    }

    h1 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #e2e8f0;
    }

    p {
      font-size: 0.9rem;
      color: #94a3b8;
      margin: 0 0 10px;
    }

    input[type="file"] {
      padding: 10px;
      border-radius: 10px;
      background: #0f172a;
      border: 1px solid #334155;
      color: #e2e8f0;
      cursor: pointer;
      transition: border 0.2s, background 0.2s;
    }

    input[type="file"]:hover {
      background: #1e293b;
      border-color: #6366f1;
    }

    .btn {
      padding: 12px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      background: linear-gradient(135deg, #6366f1, #3b82f6);
      color: white;
      transition: transform 0.15s ease, opacity 0.2s;
      text-align: center;
      text-decoration: none;
    }

    .btn:hover {
      opacity: 0.95;
      transform: scale(1.03);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    #download {
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>PDF → TXT</h1>
    <p>Selecione um arquivo PDF para extrair o texto.<br><small>(Ou pressione a tecla <b>D</b>)</small></p>
    <input id="file" type="file" accept="application/pdf" />
    <a id="download" class="btn" download>Baixar TXT</a>
  </div>

  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

    const fileInput = document.getElementById('file');
    const downloadA = document.getElementById('download');

    async function extractTextFromPDF(arrayBuffer) {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(item => item.str);
        fullText += strings.join(' ') + '\n\n';
      }
      return fullText.trim();
    }

    async function enviarParaServidor(texto, livroId) {
      try {
        const response = await fetch("http://localhost:3000/upload-text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto, livroId }),
        });

        const result = await response.json();
        console.log(result);
        alert(`Texto enviado para o Livro-${livroId} com sucesso!`);
      } catch (err) {
        console.error("Erro ao enviar para servidor:", err);
        alert("Erro ao enviar para servidor. Veja o console.");
      }
    }

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file || !/pdf$/i.test(file.type)) {
        alert("Selecione um arquivo PDF válido.");
        return;
      }

      try {
        const buf = await file.arrayBuffer();
        const text = await extractTextFromPDF(buf);

        // 🔹 Pergunta o número do livro
        let livroId = prompt("Digite o número do livro (5, 6 ou 7):");
        if (!["5","6","7"].includes(livroId)) {
          alert("Número de livro inválido! Use 5, 6 ou 7.");
          return;
        }

        // 🔹 Envia para o servidor
        await enviarParaServidor(text, livroId);

      } catch (err) {
        alert("Erro ao ler o PDF.");
        console.error(err);
      }
    });

    // 🔹 Atalho: pressionar "D" abre seletor de arquivo
    document.addEventListener("keydown", (e) => {
      if (e.key.toLowerCase() === "d") {
        fileInput.click();
      }
    });
  </script>
</body>
</html>
