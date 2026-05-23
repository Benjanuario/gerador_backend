// CONTROLLER PARA gratisunluckquinzenal.html
// Toda a lógica de geração do PDF foi migrada do frontend

const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fetch = require('node-fetch');
const crypto = require('crypto');

// Configurações
const GAS_MANUAL_URL = 'https://script.google.com/macros/s/AKfycbziPSkr3up43b7-xEZo2PX7lhvUHEuKjTl3q54uvj-lVc6WSBF3QNCoM_09v3V4zBbXIA/exec';

// Função para formatar nome da escola (igual ao frontend)
function formatarNomeEscola(nome) {
  if (!nome) return '';
  let nomeFormatado = nome.trim();
  nomeFormatado = nomeFormatado.replace(/^Escola\s+/i, '');
  nomeFormatado = nomeFormatado.replace(/^escola\s+/i, '');
  return nomeFormatado;
}

// ========== FUNÇÃO PRINCIPAL DE GERAR PDF (COPIADA DO FRONTEND) ==========
async function gerarPDFBackend(planoData) {
  return new Promise(async (resolve, reject) => {
    try {
      // Extrair dados do plano
      const html = planoData.html || '';
      const parser = new DOMParser();
      const docHtml = parser.parseFromString(html, 'text/html');
      
      let headers = ['SEMANA', 'U.TEMATICA', 'OBJECTIVOS ESPECIFICOS', 'CONTEUDOS', 'COMPETENCIAS BASICAS', 'C.H.'];
      let rows = [];

      const tabela = docHtml.querySelector('#tabelaPlano');
      if (tabela) {
        const thead = tabela.querySelector('thead');
        const tbody = tabela.querySelector('tbody');
        if (thead && tbody) {
          const ths = thead.querySelectorAll('th');
          if (ths.length >= 6) headers = Array.from(ths).map(th => th.textContent.trim() || 'Col');
          const trs = tbody.querySelectorAll('tr');
          rows = Array.from(trs).map(tr => {
            const tds = tr.querySelectorAll('td');
            return Array.from(tds).map(td => {
              let text = td.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '').replace(/\n{2,}/g, '\n').trim();
              if (text.includes('•')) text = text.replace(/•/g, '\n•').replace(/^\n/, '').replace(/\n{2,}/g, '\n');
              return text;
            });
          });
        }
      }

      // Configurar PDF
      const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      doc.setFont("times", "normal");
      doc.setTextColor(0, 0, 0);

      let yPos = 6;
      const emblemaURL = "https://profbenjanuario-4d854.web.app/icons/emblema.png";
      
      // Adicionar emblema
      try {
        const response = await fetch(emblemaURL);
        const buffer = await response.buffer();
        const imgBase64 = buffer.toString('base64');
        doc.addImage(imgBase64, 'PNG', 138, yPos, 18, 18);
        yPos += 22;
      } catch (e) {
        yPos += 5;
      }

      const provincia = planoData.provincia || "___________";
      const distrito = planoData.distrito || "___________";
      const anoAtual = new Date().getFullYear();

      // Cabeçalho do documento
      doc.setFontSize(14);
      doc.text("REPUBLICA DE MOCAMBIQUE", 148, yPos, { align: 'center' });
      yPos += 4.2;
      doc.text("MINISTERIO DA EDUCACAO E CULTURA", 148, yPos, { align: 'center' });
      yPos += 4.2;
      doc.text(`PROVINCIA DE ${provincia.toUpperCase()}`, 148, yPos, { align: 'center' });
      yPos += 4.2;
      doc.text(`GOVERNO DISTRITAL DE ${distrito.toUpperCase()}`, 148, yPos, { align: 'center' });
      yPos += 4.2;
      doc.text("SERVICO DISTRITAL DE EDUCACAO, JUVENTUDE E TECNOLOGIA", 148, yPos, { align: 'center' });
      yPos += 4.5;
      doc.setFontSize(12);
      doc.text("------------------------X----------------------", 148, yPos, { align: 'center' });
      yPos += 4.5;

      doc.setFontSize(11);
      
      // Informações de ZIP e Escola
      let zipInfoTexto = '';
      if (planoData.zipNome && planoData.zipNumero) {
        zipInfoTexto = `ZIP: ${planoData.zipNome} \u2013 N\u00BA: ${planoData.zipNumero}`;
      }
      
      const nomeEscolaFormatado = formatarNomeEscola(planoData.nomeEscola);
      if (nomeEscolaFormatado) {
        if (zipInfoTexto) {
          zipInfoTexto += ' ---- Escola: ' + nomeEscolaFormatado;
        } else {
          zipInfoTexto = 'Escola: ' + nomeEscolaFormatado;
        }
      }
      
      if (zipInfoTexto) {
        doc.text(zipInfoTexto, 148, yPos, { align: 'center' });
        yPos += 4;
      }
      
      const dosif = docHtml.querySelector('.dosificacao')?.textContent || 
        `Dosificacao Quinzenal de ${planoData.disciplina || ''} – ${planoData.classe || ''}, ${planoData.trimestre || ''}`;
      doc.text(dosif, 148, yPos, { align: 'center' });
      yPos += 5;

      const pageWidth = doc.internal.pageSize.getWidth();

      // Retângulo esquerdo (Delegado)
      const rectEsqX = 5, rectEsqY = 10, rectEsqLarg = 65, rectEsqAlt = 38;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.roundedRect(rectEsqX, rectEsqY, rectEsqLarg, rectEsqAlt, 3, 3);
      doc.setFontSize(11);
      doc.setFont("times", "bold");
      doc.text("O DELEGADO DA DISCIPLINA", rectEsqX + rectEsqLarg/2, rectEsqY + 12, { align: 'center' });
      doc.setLineWidth(0.2);
      doc.line(rectEsqX + 3, rectEsqY + 28, rectEsqX + rectEsqLarg - 3, rectEsqY + 28);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(`________/________/${anoAtual}`, rectEsqX + rectEsqLarg/2, rectEsqY + 33, { align: 'center' });

      // Retângulo direito (Visto)
      const rectDirX = pageWidth - 70, rectDirY = 10, rectDirLarg = 65, rectDirAlt = 38;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.roundedRect(rectDirX, rectDirY, rectDirLarg, rectDirAlt, 3, 3);
      doc.setFontSize(11);
      doc.setFont("times", "italic");
      doc.text("VISTO", rectDirX + rectDirLarg/2, rectDirY + 8, { align: 'center' });
      doc.setFont("times", "bold");
      doc.text("O DAP", rectDirX + rectDirLarg/2, rectDirY + 18, { align: 'center' });
      doc.setLineWidth(0.2);
      doc.line(rectDirX + 3, rectDirY + 28, rectDirX + rectDirLarg - 3, rectDirY + 28);
      doc.setFontSize(10);
      doc.setFont("times", "normal");
      doc.text(`________/________/${anoAtual}`, rectDirX + rectDirLarg/2, rectDirY + 33, { align: 'center' });

      // Gerar tabela
      if (headers.length > 0 && rows.length > 0) {
        const margin = { left: 7, right: 7 };
        const tableWidth = pageWidth - margin.left - margin.right;
        const ratios = [0.08, 0.08, 0.25, 0.30, 0.25, 0.04];
        const columnStyles = {};
        ratios.forEach((ratio, i) => { columnStyles[i] = { cellWidth: tableWidth * ratio }; });

        doc.autoTable({
          startY: yPos,
          head: [headers],
          body: rows,
          styles: { font: 'times', fontSize: 11, cellPadding: 2.5, overflow: 'linebreak', valign: 'top', halign: 'left', textColor: [0,0,0], lineColor: [0,0,0], lineWidth: 0.2 },
          headStyles: { fillColor: [180,180,180], textColor: [0,0,0], fontStyle: 'bold', halign: 'center', valign: 'middle' },
          bodyStyles: { valign: 'top' },
          columnStyles: { ...columnStyles, 0: { ...columnStyles[0], valign: 'middle', halign: 'center' }, 1: { ...columnStyles[1], valign: 'middle', halign: 'center' }, 5: { ...columnStyles[5], valign: 'middle', halign: 'center' } },
          margin: { left: 7, right: 7 },
          tableWidth: 'wrap',
          showHead: 'firstPage'
        });
      }

      const disciplina = planoData.disciplina || 'Disciplina';
      const classe = planoData.classe || 'Classe';
      const trimestre = planoData.trimestre || 'Trimestre';
      const nomeArquivo = `Plano Quinzenal de ${disciplina} - ${classe}, ${trimestre}.pdf`;

      const pdfBuffer = doc.output('arraybuffer');
      resolve({ buffer: Buffer.from(pdfBuffer).toString('base64'), nome: nomeArquivo });
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      reject(err);
    }
  });
}

// ========== CONTROLLERS ==========

// 1. Gerar PDF (rota principal)
exports.gerarPDF = async (req, res) => {
  try {
    const { planoData } = req.body;
    
    if (!planoData || !planoData.html) {
      return res.status(400).json({ success: false, error: 'Dados do plano não fornecidos' });
    }
    
    const pdf = await gerarPDFBackend(planoData);
    
    res.json({
      success: true,
      pdf: pdf.buffer,
      nomeArquivo: pdf.nome
    });
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    res.status(500).json({ success: false, error: 'Erro ao gerar PDF' });
  }
};

// 2. Consumir crédito
exports.consumirCredito = async (req, res) => {
  try {
    const { userId, planType } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Usuário não identificado' });
    }
    
    // Importar CreditsManager do seu sistema
    // const { CreditsManager } = require('../credits-manager');
    // const consumo = await CreditsManager.consumir(userId, planType);
    
    // Simulação (substitua pela sua lógica real)
    const consumo = { success: true, remainingCredits: 4, message: 'Crédito consumido' };
    
    if (!consumo.success) {
      return res.status(400).json({ success: false, error: consumo.message });
    }
    
    res.json({
      success: true,
      remainingCredits: consumo.remainingCredits,
      message: consumo.message
    });
    
  } catch (error) {
    console.error('Erro ao consumir crédito:', error);
    res.status(500).json({ success: false, error: 'Erro ao processar' });
  }
};

// 3. Validar código manual
exports.validarCodigo = async (req, res) => {
  try {
    const { code, userId, userEmail } = req.body;
    
    if (!code || code.length !== 8) {
      return res.status(400).json({ valid: false, message: 'Digite um código de 8 caracteres' });
    }
    
    const response = await fetch(`${GAS_MANUAL_URL}?action=validar&codigo=${code}&usuario_id=${encodeURIComponent(userId)}&usuario_email=${encodeURIComponent(userEmail)}`);
    const resultado = await response.json();
    
    if (resultado.valido) {
      res.json({
        valid: true,
        credits: resultado.creditos,
        message: resultado.mensagem
      });
    } else {
      res.status(400).json({ valid: false, message: resultado.mensagem });
    }
    
  } catch (error) {
    console.error('Erro ao validar código:', error);
    res.status(500).json({ valid: false, message: 'Erro ao validar código' });
  }
};

// 4. Verificar créditos do usuário
exports.verificarCreditos = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Usuário não identificado' });
    }
    
    // Importar CreditsManager do seu sistema
    // const { CreditsManager } = require('../credits-manager');
    // const status = await CreditsManager.getStatus(userId);
    
    // Simulação (substitua pela sua lógica real)
    const status = { total: 5, hasCredits: true, welcome: 2, purchased: 3 };
    
    res.json({
      success: true,
      credits: status.total,
      hasCredits: status.hasCredits,
      welcome: status.welcome,
      purchased: status.purchased
    });
    
  } catch (error) {
    console.error('Erro ao verificar créditos:', error);
    res.status(500).json({ success: false, error: 'Erro ao verificar' });
  }
};
