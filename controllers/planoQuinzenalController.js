const fetch = require('node-fetch');

// ============================================
// DADOS ESTÁTICOS
// ============================================

const dadosMocambique = {
    "Niassa": ["Cuamba", "Chimbunila", "Lago", "Lichinga", "Majune", "Mandimba", "Marrupa", "Maúa", "Mavago", "Mecanhelas", "Mecula", "Metarica", "Muembe", "Nipepe", "N'gauma", "Sanga"],
    "Cabo Delgado": ["Ancuabe", "Balama", "Chiúre", "Ibo", "Macomia", "Mecúfi", "Meluco", "Mocímboa da Praia", "Montepuez", "Mueda", "Metuge", "Muidumbe", "Namuno", "Nangade", "Palma", "Pemba", "Quissanga"],
    "Nampula": ["Angoche", "Eráti", "Ilha de Moçambique", "Lalaua", "Larde", "Liúpo", "Malema", "Meconta", "Mecubúri", "Mogincual", "Mogovolas", "Moma", "Monapo", "Mossuril", "Muecate", "Murrupula", "Memba", "Nacala-a-Velha", "Nacarôa", "Nampula", "Rapale", "Ribaue"],
    "Zambézia": ["Alto Molócuè", "Chinde", "Derre", "Gilé", "Gurué", "Ile", "Inhassunge", "Luabo", "Lugela", "Maganja da Costa", "Milange", "Mocuba", "Mopeia", "Morrumbala", "Mulevala", "Mulumbo", "Namacurra", "Namarroi", "Nicoadala", "Pebane", "Quelimane"],
    "Tete": ["Angónia", "Cahora-Bassa", "Changara", "Chifunde", "Chiuta", "Doa", "Macanga", "Mágoè", "Marara", "Marávia", "Moatize", "Mutarara", "Tete", "Tsangano", "Zumbo"],
    "Manica": ["Bárue", "Chimoio", "Gondola", "Guro", "Machaze", "Macossa", "Manica", "Mossurize", "Sussundenga", "Tambara", "Vanduzi"],
    "Sofala": ["Beira", "Búzi", "Caia", "Chemba", "Cheringoma", "Chibabava", "Dondo", "Gorongosa", "Machanga", "Marínguè", "Marromeu", "Muanza", "Nhamatanda"],
    "Inhambane": ["Funhalouro", "Govuro", "Homoíne", "Inhambane", "Inharrime", "Inhassoro", "Jangamo", "Mabote", "Massinga", "Morrumbene", "Panda", "Vilankulo", "Zavala"],
    "Gaza": ["Bilene", "Chibuto", "Chicualacuala", "Chigubo", "Chókwè", "Chongoene", "Guijá", "Limpopo", "Mabalane", "Manjacaze", "Mapai", "Massangena", "Massingir", "Xai-Xai"],
    "Maputo": ["Boane", "Magude", "Manhiça", "Marracuene", "Matola", "Matutuíne", "Moamba", "Namaacha", "KaMpfumo", "KaMubukwana", "KaMaxaquene", "KaMavota", "KaTembe", "KaNyaka"]
};

const disciplinasPorClasse = {
    "1ª Classe": ["Português", "Matemática", "Educação Física"],
    "2ª Classe": ["Português", "Matemática", "Educação Física"],
    "3ª Classe": ["Português", "Matemática", "Educação Física"],
    "4ª Classe": ["Português", "Matemática", "Ciências Naturais", "Ciências Sociais", "Educação Física"],
    "5ª Classe": ["Português", "Matemática", "Ciências Naturais", "Ciências Sociais", "EVO", "Educação Física"],
    "6ª Classe": ["Português", "Matemática", "Ciências Naturais", "Ciências Sociais", "EVO", "Educação Física"],
    "7ª Classe": ["Português", "Matemática", "Biologia", "Química", "Física", "Geografia", "História", "TIC", "Agropecuária", "Inglês", "EVT", "Educação Física"],
    "8ª Classe": ["Português", "Matemática", "Biologia", "Química", "Física", "Geografia", "História", "TIC", "Agropecuária", "Francês", "Inglês", "EVT", "Educação Física"],
    "9ª Classe": ["Português", "Matemática", "Biologia", "Química", "Física", "Geografia", "História", "TIC", "Inglês", "Agropecuária", "Francês", "EVT", "Educação Física"],
    "10ª Classe": ["Português", "Matemática", "Biologia", "Química", "Física", "Geografia", "História", "Filosofia", "TIC", "Inglês", "Agropecuária", "Francês", "Noções de Empreendedorismo", "EVT", "Educação Física"],
    "11ª Classe": ["Português", "Matemática 'Letras'", "Matemática 'Ciências'", "Biologia", "Química", "Física", "Psicologia", "Geografia", "História", "TIC", "Inglês", "Francês", "Filosofia", "Noções de Empreendedorismo", "EVT", "DGD", "Educação Física"],
    "12ª Classe": ["Português", "Matemática 'Letras'", "Matemática 'Ciências'", "Biologia", "Química", "Física", "Psicologia", "Geografia", "História", "TIC", "Inglês", "Francês", "Filosofia", "Noções de Empreendedorismo", "EVT", "DGD", "Educação Física"]
};

const datasInicioTrimestre = {
    "1º Trimestre": new Date(2025, 2, 2),
    "2º Trimestre": new Date(2025, 6, 1),
    "3º Trimestre": new Date(2025, 8, 15)
};

const API_URL = "https://script.google.com/macros/s/AKfycbyUNAL-Ahajpg-NhztTwajJ__PY1wh2JDlEgULHpBzSnj5yDED0q4y5amdsNp954lqP/exec";

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function formatarBullets(texto) {
    if (!texto) return "";
    return texto.split(/\r?\n/)
        .map(linha => linha.trim())
        .filter(linha => linha.length > 0)
        .map(linha => linha.replace(/^[\-\•]\s?/, '• '))
        .join('<br>');
}

function calcularDatasSemana(trimestre, semanaNumero) {
    const dataInicioTrimestre = datasInicioTrimestre[trimestre];
    if (!dataInicioTrimestre) return { inicio: null, fim: null };
    
    const dataInicioSemana = new Date(dataInicioTrimestre);
    dataInicioSemana.setDate(dataInicioSemana.getDate() + (semanaNumero - 1) * 7);
    const dataFimSemana = new Date(dataInicioSemana);
    dataFimSemana.setDate(dataFimSemana.getDate() + 4);
    
    return { inicio: dataInicioSemana, fim: dataFimSemana };
}

function formatarDataBR(data) {
    if (!data) return { dd: '__', mm: '__' };
    return {
        dd: String(data.getDate()).padStart(2, '0'),
        mm: String(data.getMonth() + 1).padStart(2, '0')
    };
}

// ============================================
// CONTROLLERS
// ============================================

exports.getDadosIniciais = async (req, res) => {
    try {
        const provincias = Object.keys(dadosMocambique).sort();
        const primeiraProvincia = provincias[0];
        const distritos = dadosMocambique[primeiraProvincia] || [];
        const disciplinas = disciplinasPorClasse["1ª Classe"] || [];
        
        res.json({
            success: true,
            provincias: provincias,
            distritos: distritos.sort(),
            disciplinas: disciplinas
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar dados' });
    }
};

exports.getDistritos = async (req, res) => {
    try {
        const { provincia } = req.body;
        const distritos = dadosMocambique[provincia] || [];
        res.json({ success: true, distritos: distritos.sort() });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar distritos' });
    }
};

exports.getDisciplinas = async (req, res) => {
    try {
        const { classe } = req.body;
        const disciplinas = disciplinasPorClasse[classe] || [];
        res.json({ success: true, disciplinas: disciplinas });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar disciplinas' });
    }
};

exports.buscarConteudos = async (req, res) => {
    try {
        const { classe, disciplina, trimestre, semanaDe, semanaAte } = req.body;
        
        if (!classe || !disciplina || !trimestre) {
            return res.status(400).json({ success: false, error: 'Dados incompletos' });
        }
        
        const url = `${API_URL}?classe=${encodeURIComponent(classe)}&disciplina=${encodeURIComponent(disciplina)}&trimestre=${encodeURIComponent(trimestre)}&semanaDe=${semanaDe}&semanaAte=${semanaAte}`;
        const response = await fetch(url);
        const planos = await response.json();
        
        res.json({ success: true, conteudos: planos });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar conteúdos' });
    }
};

exports.gerarPlano = async (req, res) => {
    try {
        const {
            provincia, distrito, zipNome, zipNumero, nomeEscola,
            classe, disciplina, trimestre, conteudos, semanaDe, semanaAte
        } = req.body;
        
        if (!provincia || !distrito || !classe || !disciplina || !trimestre || !conteudos) {
            return res.status(400).json({ success: false, error: 'Dados incompletos' });
        }
        
        const ano = new Date().getFullYear();
        const semanas = [];
        for (let i = semanaDe; i <= semanaAte; i++) semanas.push(i);
        const filtrados = conteudos.filter(p => semanas.includes(p.numero));
        
        // Cabeçalho ZIP/Escola
        let htmlCabecalho = '';
        if (zipNome && zipNumero) htmlCabecalho += `ZIP: ${zipNome} – Nº: ${zipNumero}`;
        if (nomeEscola) {
            if (htmlCabecalho) htmlCabecalho += '<br>';
            htmlCabecalho += `Escola: ${nomeEscola}`;
        }
        
        // Tabela
        let tabelaHtml = '';
        for (const p of filtrados) {
            const datas = calcularDatasSemana(trimestre, p.numero);
            const inicio = formatarDataBR(datas.inicio);
            const fim = formatarDataBR(datas.fim);
            
            tabelaHtml += `
                <tr>
                    <td style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: middle;">
                        ${p.numero}ª Semana<br>
                        <small>
                            Data: De: 
                            <input type="text" class="data-input" value="${inicio.dd}" placeholder="dd" maxlength="2">/
                            <input type="text" class="data-input" value="${inicio.mm}" placeholder="mm" maxlength="2">/${ano} 
                            até: 
                            <input type="text" class="data-input" value="${fim.dd}" placeholder="dd" maxlength="2">/
                            <input type="text" class="data-input" value="${fim.mm}" placeholder="mm" maxlength="2">/${ano}
                        </small>
                    </td>
                    <td contenteditable="true" style="border: 1px solid black; padding: 6px; vertical-align: top;">${formatarBullets(p.unidade_tematica)}</td>
                    <td contenteditable="true" style="border: 1px solid black; padding: 6px; vertical-align: top;">${formatarBullets(p.objetivo_especifico)}</td>
                    <td contenteditable="true" style="border: 1px solid black; padding: 6px; vertical-align: top;">${formatarBullets(p.conteudo)}</td>
                    <td contenteditable="true" style="border: 1px solid black; padding: 6px; vertical-align: top;">${formatarBullets(p.competencia_basica)}</td>
                    <td contenteditable="true" style="border: 1px solid black; padding: 6px; text-align: center; vertical-align: middle;">${formatarBullets(p.carga_horaria)}</td>
                </tr>
            `;
        }
        
        // HEADERS com idioma
        let headers = ['SEMANA', 'U.TEMATICA', 'OBJECTIVOS ESPECIFICOS', 'CONTEUDOS', 'COMPETENCIAS BASICAS', 'C.H.'];
        if (disciplina.toLowerCase().includes('inglês') || disciplina.toLowerCase() === 'inglês') {
            headers = ['WEEK', 'THEMATIC UNIT', 'SPECIFIC OBJECTIVES', 'CONTENTS', 'BASIC COMPETENCES', 'L.H.'];
        } else if (disciplina.toLowerCase().includes('francês') || disciplina.toLowerCase() === 'francês') {
            headers = ['SEMAINE', 'UNITÉ THÉMATIQUE', 'OBJECTIFS SPÉCIFIQUES', 'CONTENUS', 'COMPÉTENCES DE BASE', 'H.H.'];
        }
        
        // GERAR HTML COMPLETO igual ao que o frontend espera
        const htmlCompleto = `
            <div class="cabecalho-plano">
                <img src="icons/emblema.png" alt="Emblema de Moçambique" onerror="this.style.display='none'">
                <div class="linha-instituicao">REPÚBLICA DE MOÇAMBIQUE</div>
                <div class="linha-instituicao">MINISTÉRIO DA EDUCAÇÃO E CULTURA</div>
                <div class="linha-instituicao">PROVÍNCIA DE ${provincia.toUpperCase()}</div>
                <div class="linha-instituicao">GOVERNO DISTRITAL DE ${distrito.toUpperCase()}</div>
                <div class="linha-instituicao">SERVIÇO DISTRITAL DE EDUCAÇÃO, JUVENTUDE E TECNOLOGIA</div>
                <div class="separador">------------------------X-------------------</div>
                <div class="zip-info">${htmlCabecalho}</div>
                <div class="dosificacao">Dosificação Quinzenal de ${disciplina} – ${classe}, ${trimestre} / ${ano}</div>
            </div>
            <div class="tabela-wrapper">
                <table id="tabelaPlano">
                    <thead>
                        <tr>
                            ${headers.map(h => `<th>${h}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody id="tabelaCorpo">
                        ${tabelaHtml}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 10px;">
                <button onclick="focarEdicao()" class="btn-plano">
                    ✏️ Editar o Plano
                </button>
                <button onclick="irParaPagamento()" class="btn-plano">
                    📥 EXPORTAR PDF (BAIXAR O PLANO)
                </button>
            </div>
        `;
        
        // Dados para salvar no sessionStorage
        const planoData = {
            provincia, distrito,
            zipNome: zipNome || '', zipNumero: zipNumero || '', nomeEscola: nomeEscola || '',
            classe, disciplina, trimestre,
            html: htmlCompleto
        };
        
        res.json({
            success: true,
            html: htmlCompleto,
            planoData: planoData,
            totalSemanas: filtrados.length
        });
        
    } catch (error) {
        console.error('Erro ao gerar plano:', error);
        res.status(500).json({ success: false, error: 'Erro ao gerar plano' });
    }
};

exports.validarDados = async (req, res) => {
    try {
        const { semanaDe, semanaAte } = req.body;
        const errors = [];
        
        if (semanaDe && semanaAte) {
            if (semanaDe > semanaAte) errors.push('Semana inicial não pode ser maior que a final');
            if (semanaAte - semanaDe + 1 >= 4) errors.push('Selecione intervalo de três semanas no máximo');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }
        res.json({ success: true, message: 'Dados válidos' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro na validação' });
    }
};

exports.getSemanas = async (req, res) => {
    try {
        const semanas = [];
        for (let i = 1; i <= 13; i++) {
            semanas.push({ value: i, label: `${i}ª Semana` });
        }
        res.json({ success: true, semanas });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Erro ao buscar semanas' });
    }
};
