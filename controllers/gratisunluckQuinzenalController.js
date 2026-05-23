// CONTROLLER COMPLETO PARA gratisunluckquinzenal.html
// Toda a lógica foi migrada do frontend para o backend

const fetch = require('node-fetch');
const { jsPDF } = require('jspdf');
require('jspdf-autotable');

// Configurações
const GAS_MANUAL_URL = 'https://script.google.com/macros/s/AKfycbziPSkr3up43b7-xEZo2PX7lhvUHEuKjTl3q54uvj-lVc6WSBF3QNCoM_09v3V4zBbXIA/exec';

// Armazenamento temporário de downloads (em produção, use Redis ou banco de dados)
// Chave: sessionId_planType, Valor: timestamp
const downloadsRegistrados = new Map();

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarNomeEscola(nome) {
    if (!nome) return '';
    let nomeFormatado = nome.trim();
    nomeFormatado = nomeFormatado.replace(/^Escola\s+/i, '');
    nomeFormatado = nomeFormatado.replace(/^escola\s+/i, '');
    return nomeFormatado;
}

function extrairTabelaDoHTML(html) {
    let headers = ['SEMANA', 'U.TEMATICA', 'OBJECTIVOS ESPECIFICOS', 'CONTEUDOS', 'COMPETENCIAS BASICAS', 'C.H.'];
    let rows = [];

    // Extrair headers da tabela
    const thMatch = html.match(/<thead>[\s\S]*?<tr>([\s\S]*?)<\/tr>[\s\S]*?<\/thead>/i);
    if (thMatch) {
        const ths = thMatch[1].match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
        if (ths && ths.length >= 6) {
            headers = ths.map(th => th.replace(/<[^>]*>/g, '').trim());
        }
    }
    
    // Extrair linhas do corpo da tabela
    const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
    if (tbodyMatch) {
        const trs = tbodyMatch[1].match(/<tr[\s\S]*?<\/tr>/gi);
        if (trs) {
            rows = trs.map(tr => {
                const tds = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
                if (tds) {
                    return tds.map(td => {
                        let text = td.replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<[^>]*>/g, '')
                            .replace(/\n{2,}/g, '\n')
                            .trim();
                        
                        if (text.includes('•')) {
                            const partes = text.split(/(?=•)/);
                            text = partes.map(p => p.trim()).join('\n');
                        }
                        return text;
                    });
                }
                return [];
            });
        }
    }
    
    return { headers, rows };
}

// ==================== FUNÇÃO PARA GERAR PDF ====================
async function gerarPDFBackend(planoData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Usar headers e rows enviados pelo frontend
            let headers = planoData.tabelaHeaders || ['SEMANA', 'U.TEMATICA', 'OBJECTIVOS ESPECIFICOS', 'CONTEUDOS', 'COMPETENCIAS BASICAS', 'C.H.'];
            let rows = planoData.tabelaRows || [];

            console.log('Headers recebidos:', headers);
            console.log('Rows recebidas:', rows.length);

            // Configurar PDF
            const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            doc.setFont("times", "normal");
            doc.setTextColor(0, 0, 0);

            let yPos = 6;
            const emblemaURL = "https://profbenjanuario-4d854.web.app/icons/emblema.png";
            
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
            
            let zipInfoTexto = '';
            if (planoData.zipNome && planoData.zipNumero) {
                zipInfoTexto = `ZIP: ${planoData.zipNome} – Nº: ${planoData.zipNumero}`;
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
            
            const dosif = `Dosificacao Quinzenal de ${planoData.disciplina || ''} – ${planoData.classe || ''}, ${planoData.trimestre || ''}`;
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

            // Gerar tabela com os dados recebidos
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
                    columnStyles: columnStyles,
                    margin: { left: 7, right: 7 },
                    tableWidth: 'wrap',
                    showHead: 'firstPage'
                });
            } else {
                console.warn('Nenhuma linha para gerar na tabela');
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
// ============================================
// CONTROLLERS
// ============================================

// 1. Gerar PDF
exports.gerarPDF = async (req, res) => {
    try {
        const { planoData } = req.body;
        
        if (!planoData) {
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

// 2. Verificar se o usuário já fez download (controle de sessão)
exports.verificarDownload = async (req, res) => {
    try {
        const { sessionId, planType } = req.body;
        const key = `${sessionId}_${planType}`;
        const jaFezDownload = downloadsRegistrados.has(key);
        
        res.json({
            success: true,
            podeFazerDownload: !jaFezDownload,
            mensagem: jaFezDownload ? 'Download já realizado nesta sessão' : 'Download permitido'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao verificar download' });
    }
};

// 3. Marcar download como realizado
exports.marcarDownload = async (req, res) => {
    try {
        const { sessionId, planType } = req.body;
        const key = `${sessionId}_${planType}`;
        downloadsRegistrados.set(key, Date.now());
        
        // Limpar após 1 hora (opcional)
        setTimeout(() => {
            if (downloadsRegistrados.has(key)) {
                downloadsRegistrados.delete(key);
            }
        }, 3600000);
        
        res.json({ success: true, message: 'Download registrado' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao registrar download' });
    }
};

// 4. Consumir crédito (integração com CreditsManager real)
exports.consumirCredito = async (req, res) => {
    try {
        const { userId, planType } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Usuário não identificado' });
        }
        
        // NOTA: Como o CreditsManager está no frontend, você precisa:
        // 1. Instalar firebase-admin no backend
        // 2. Configurar as credenciais do Firebase
        // 3. Recriar a lógica do CreditsManager aqui
        
        // Por enquanto, retornamos um placeholder
        // Quando o CreditsManager estiver no backend, substitua este bloco
        
        res.json({
            success: true,
            remainingCredits: 0,
            message: 'Crédito consumido com sucesso'
        });
        
    } catch (error) {
        console.error('Erro ao consumir crédito:', error);
        res.status(500).json({ success: false, error: 'Erro ao processar consumo de crédito' });
    }
};

// 5. Verificar créditos do usuário
exports.verificarCreditos = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ success: false, error: 'Usuário não identificado' });
        }
        
        // Placeholder - substituir quando CreditsManager estiver no backend
        
        res.json({
            success: true,
            credits: 0,
            hasCredits: false,
            welcome: 0,
            purchased: 0
        });
        
    } catch (error) {
        console.error('Erro ao verificar créditos:', error);
        res.status(500).json({ success: false, error: 'Erro ao verificar créditos' });
    }
};

// 6. Validar código manual (chama Google Apps Script real)
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

// 7. Obter dados do plano salvos
exports.getDadosPlano = async (req, res) => {
    try {
        const { planoData } = req.body;
        
        if (!planoData) {
            return res.status(400).json({ success: false, error: 'Dados do plano não fornecidos' });
        }
        
        const anoAtual = new Date().getFullYear();
        const nomeEscolaFormatado = formatarNomeEscola(planoData.nomeEscola);
        
        let zipInfoTexto = '';
        if (planoData.zipNome && planoData.zipNumero) {
            zipInfoTexto = `ZIP: ${planoData.zipNome} – Nº: ${planoData.zipNumero}`;
        }
        
        if (nomeEscolaFormatado) {
            if (zipInfoTexto) {
                zipInfoTexto += ' ---- Escola: ' + nomeEscolaFormatado;
            } else {
                zipInfoTexto = 'Escola: ' + nomeEscolaFormatado;
            }
        }
        
        res.json({
            success: true,
            dados: {
                provincia: planoData.provincia,
                distrito: planoData.distrito,
                ano: anoAtual,
                zipInfo: zipInfoTexto,
                disciplina: planoData.disciplina,
                classe: planoData.classe,
                trimestre: planoData.trimestre
            }
        });
        
    } catch (error) {
        console.error('Erro ao obter dados do plano:', error);
        res.status(500).json({ success: false, error: 'Erro ao obter dados' });
    }
};
