/* ============================================================
   BLACK LIPS ERP - ARQUIVO JS LIMPO E CORRIGIDO
   ============================================================ */

const API_URL = "https://erp-blacklips-api.onrender.com";
const lista = document.getElementById('lista');
const loadingOverlay = document.getElementById('loadingOverlay');

// 1. CARREGAMENTO INICIAL
window.onload = function() {
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    try {
        const dadosLocais = localStorage.getItem('visionBlackV6');
        if (dadosLocais && dadosLocais.trim() !== "") {
            lista.innerHTML = dadosLocais;
            reativarEventos();
            atualizarTotaisGerais();
        } else {
            novoItem();
        }
    } catch (e) { 
        novoItem(); 
    }

    buscarDaNuvem(); 
};

// 2. DISPONIBILIZAR FUNÇÕES PARA O HTML
// (Isso é o que conserta o erro "not defined")
window.novoItem = novoItem;
window.apagar = apagar;
window.salvar = salvar;
window.enviarParaNuvem = enviarParaNuvem;
window.limpar = limpar;
window.calcular = calcular;
window.alternarMenu = alternarMenu;
window.gerarPDF = gerarPDF;

/* --- ALTERAÇÃO NA FUNÇÃO salvar --- */
function salvar() {
    // 1. Salva os inputs
    const inputs = lista.querySelectorAll('input');
    inputs.forEach(input => input.setAttribute('value', input.value));
    
    // 2. Salva a altura da LINHA (buscando pela div row-resizer)
    const resizers = lista.querySelectorAll('.row-resizer');
    resizers.forEach(resizer => {
        if(resizer.style.height) {
            resizer.setAttribute('style', `height:${resizer.style.height}`);
        }
    });

    localStorage.setItem('visionBlackV6', lista.innerHTML);
    atualizarTotaisGerais();
}

async function buscarDaNuvem() {
    try {
        const res = await fetch(`${API_URL}/listar_produtos?t=${new Date().getTime()}`);
        if (res.ok) {
            const dados = await res.json();
            if (dados && dados.length > 0) {
                lista.innerHTML = ''; 
                dados.forEach(item => {
                    const tr = novoItem(true); 
                    const inputs = tr.querySelectorAll('input');
                    inputs[0].value = item.nome || "";
                    inputs[1].value = item.quantidade || 1;
                    
                    let valCusto = parseFloat(item.custo || 0);
                    let valVenda = parseFloat(item.venda || 0);
                    inputs[2].value = valCusto.toFixed(2).replace('.', ',');
                    inputs[3].value = valVenda.toFixed(2).replace('.', ',');
                    
                    inputs.forEach(i => i.setAttribute('value', i.value));
                    calcular(inputs[1], false);
                });
                salvar();
                atualizarStatus('<i class="fa-solid fa-check-double"></i> Sincronizado', "#4caf50");
            }
        }
    } catch (error) {
        atualizarStatus('<i class="fa-solid fa-wifi"></i> Offline', "#9e9e9e");
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
}

async function enviarParaNuvem() {
    const btnSave = document.querySelector('.btn-save');
    if (btnSave) btnSave.disabled = true;
    atualizarStatus('Enviando...', "#2196f3");
    
    const linhas = lista.querySelectorAll('tr');
    const dadosParaEnviar = [];
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        const nome = inputs[0].value.trim();
        const qtd = parseInt(inputs[1].value) || 1;
        const custo = lerNumero(inputs[2].value);
        const venda = lerNumero(inputs[3].value);
        if (nome || venda > 0) dadosParaEnviar.push({ nome, quantidade: qtd, custo, venda });
    });

    try {
        const response = await fetch(`${API_URL}/salvar_produto`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lista_produtos: dadosParaEnviar })
        });
        if(response.ok) atualizarStatus('Salvo na Nuvem!', "#4caf50");
        else throw new Error();
    } catch (error) {
        atualizarStatus('Erro ao Enviar', "#f44336");
    } finally {
        if (btnSave) btnSave.disabled = false;
        setTimeout(() => { 
             const s = document.getElementById('status');
             if(s && s.innerText.includes("Salvo")) atualizarStatus('Pronto', "#858585");
        }, 4000);
    }
}

function lerNumero(val) {
    if (!val) return 0;
    val = String(val);
    if (val.includes(',')) val = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(val) || 0;
}

function calcular(input, dispararSave = true) {
    const tr = input.closest('tr');
    const inputs = tr.querySelectorAll('input');
    input.setAttribute('value', input.value); 
    
    const qtd = parseInt(inputs[1].value) || 0;
    const custoUn = lerNumero(inputs[2].value);
    const vendaUn = lerNumero(inputs[3].value);
    
    const cellLucro = tr.querySelector('.profit-cell');
    const cellMargem = tr.querySelector('.margin-cell');

    if (vendaUn === 0) {
        cellLucro.innerText = "R$ 0,00";
        cellMargem.innerText = "0,00%";
        cellLucro.className = 'profit-cell';
        cellMargem.className = 'margin-cell';
    } else {
        const lucroTotal = (vendaUn - custoUn) * qtd;
        const margemPercent = ((vendaUn - custoUn) / vendaUn) * 100;
        
        cellLucro.innerText = "R$ " + lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        cellMargem.innerText = margemPercent.toFixed(2).replace('.', ',') + "%";
        
        cellLucro.className = 'profit-cell ' + (lucroTotal < 0 ? 'negative' : 'positive');
        
        let margemClass = 'positive';
        if(margemPercent < 0) margemClass = 'negative';
        else if(margemPercent < 30) margemClass = 'neutral';
        cellMargem.className = 'margin-cell ' + margemClass;
    }
    if (dispararSave) salvar();
}

function atualizarTotaisGerais() {
    let totalCusto = 0; let totalVenda = 0; let totalLucro = 0;
    const linhas = lista.querySelectorAll('tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        const qtd = parseInt(inputs[1].value) || 0;
        const custoUn = lerNumero(inputs[2].value);
        const vendaUn = lerNumero(inputs[3].value);
        totalCusto += (custoUn * qtd);
        totalVenda += (vendaUn * qtd);
        totalLucro += ((vendaUn - custoUn) * qtd);
    });
    
    document.getElementById('totalCusto').innerText = "R$ " + totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('totalVenda').innerText = "R$ " + totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const elLucro = document.getElementById('totalLucro');
    elLucro.innerText = "R$ " + totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    elLucro.className = 'profit-cell ' + (totalLucro >= 0 ? 'positive' : 'negative');
}

/* --- ALTERAÇÃO NA FUNÇÃO novoItem --- */
function novoItem(retornarElemento = false) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td><div class="resizable-box"><input type="text" oninput="salvar()"></div></td>
        <td><div class="resizable-box"><input type="tel" value="1" class="qtd-input" oninput="calcular(this)"></div></td>
        <td><div class="resizable-box"><input type="tel" placeholder="0,00" oninput="calcular(this)"></div></td>
        <td><div class="resizable-box"><input type="tel" placeholder="0,00" oninput="calcular(this)"></div></td>
        <td class="profit-cell">R$ 0,00</td>
        <td class="margin-cell" style="text-align: right;">0,00%</td>
        <td style="text-align: center;">
            <div class="row-resizer">
                <div class="trash-btn" onclick="apagar(this)"><i class="fa-solid fa-xmark"></i></div>
            </div>
        </td>
    `;
    lista.appendChild(tr);
    tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (!retornarElemento) salvar();
    return tr;
}

function apagar(btn) {
    if(confirm('Apagar item?')) { btn.closest('tr').remove(); salvar(); }
}

function reativarEventos() {
    const linhas = lista.querySelectorAll('tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        inputs[0].oninput = function() { salvar(); };
        inputs[1].oninput = function() { calcular(this); };
        inputs[2].oninput = function() { calcular(this); };
        inputs[3].oninput = function() { calcular(this); };
    });
}

function atualizarStatus(texto, cor) {
    const s = document.getElementById('status');
    if(s) { s.innerHTML = texto; s.style.color = cor; }
}

function limpar() {
    if(confirm('Limpar tudo?')) {
        try{ localStorage.removeItem('visionBlackV6'); }catch(e){}
        lista.innerHTML = ''; novoItem(); atualizarTotaisGerais();
    }
}

// ============================================================
// LÓGICA DO MENU E PDF (Corrigida)
// ============================================================

function alternarMenu() {
    console.log("Abrindo menu..."); // Debug
    const menu = document.getElementById("menuPDF");
    if (menu) menu.classList.toggle("mostrar");
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown-container')) {
        const menu = document.getElementById("menuPDF");
        if (menu && menu.classList.contains('mostrar')) {
            menu.classList.remove('mostrar');
        }
    }
}

async function gerarPDF(tipo) {
    // 1. Fecha Menu
    const menu = document.getElementById("menuPDF");
    if (menu) menu.classList.remove("mostrar");

    // 2. Verifica Biblioteca
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Erro: A biblioteca jspdf não carregou corretamente.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    // 3. Captura Dados
    const linhas = document.querySelectorAll('#lista tr');
    const dadosParaPDF = [];

    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        // Proteção contra linha vazia ou inputs não carregados
        if (!inputs || inputs.length < 2) return;

        const produto = inputs[0].value ? inputs[0].value.toUpperCase() : "";
        const qtd = inputs[1].value || "0";
        
        if (produto.trim() === "") return;

        if (tipo === 'completo') {
            const custo = inputs[2].value || "0,00";
            const venda = inputs[3].value || "0,00";
            const lucro = tr.querySelector('.profit-cell') ? tr.querySelector('.profit-cell').innerText : "0,00";
            const margem = tr.querySelector('.margin-cell') ? tr.querySelector('.margin-cell').innerText : "0%";
            dadosParaPDF.push([produto, qtd, custo, venda, lucro, margem]);
        } else {
            dadosParaPDF.push([produto, qtd, "   [   ] CONFERIDO"]); 
        }
    });

    if (dadosParaPDF.length === 0) {
        alert("A tabela está vazia!");
        return;
    }

    // 4. Configura Colunas
    let colunas = [];
    let tituloRelatorio = "";

    if (tipo === 'completo') {
        tituloRelatorio = "RELATÓRIO FINANCEIRO - BLACK LIPS ERP";
        colunas = [
            { header: 'PRODUTO', dataKey: '0' },
            { header: 'QTD', dataKey: '1' },
            { header: 'CUSTO', dataKey: '2' },
            { header: 'VENDA', dataKey: '3' },
            { header: 'LUCRO', dataKey: '4' },
            { header: 'MARGEM', dataKey: '5' }
        ];
    } else {
        tituloRelatorio = "ORDEM DE SEPARAÇÃO DE ESTOQUE";
        colunas = [
            { header: 'ITEM / DESCRIÇÃO', dataKey: '0' },
            { header: 'QTD', dataKey: '1' },
            { header: 'CONFERÊNCIA', dataKey: '2' }
        ];
    }

    // 5. Cabeçalho
    doc.setFontSize(16);
    doc.setTextColor(30, 30, 30);
    doc.text("BLACK LIPS ERP", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(tituloRelatorio, 14, 28);
    doc.text("Gerado em: " + new Date().toLocaleString(), 14, 33);

    // 6. Tabela AutoTable
    if (doc.autoTable) {
        doc.autoTable({
            head: [colunas.map(c => c.header)],
            body: dadosParaPDF,
            startY: 40,
            theme: 'grid',
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
            styles: { fontSize: 9, valign: 'middle', overflow: 'linebreak', cellPadding: 3, lineColor: [200, 200, 200] },
            headStyles: { fillColor: [45, 45, 48], textColor: [255, 255, 255], fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 15, halign: 'center' },
                2: { halign: tipo === 'completo' ? 'right' : 'left' },
                3: { halign: 'right' },
                4: { halign: 'right' },
                5: { halign: 'right' }
            },
            didDrawPage: function (data) {
                let str = 'Página ' + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                let pageSize = doc.internal.pageSize;
                let pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
                doc.text(str, data.settings.margin.left, pageHeight - 10);
            }
        });
        doc.save(tipo === 'completo' ? "Financeiro_BlackLips.pdf" : "Lista_Separacao.pdf");
    } else {
        alert("Erro: O plugin AutoTable não foi carregado. Tente recarregar a página.");
    }
}

// ============================================================
// FUNÇÃO DE VOLTAR AO HUB (O QUE FALTAVA)
// ============================================================

function voltarAoHub() {
    // Redireciona para o arquivo do menu principal
    window.location.href = "section_hub.html";
}

// Disponibiliza para o HTML usar no onclick
window.voltarAoHub = voltarAoHub;

