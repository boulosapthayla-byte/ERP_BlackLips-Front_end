/* ============================================================
   BLACK LIPS ERP - JS FINAL (COMPATIBILIDADE TOTAL)
   ============================================================ */

// CONFIGURAÇÕES GERAIS
const API_URL = "https://erp-blacklips-api.onrender.com";
const lista = document.getElementById('lista'); // Certifique-se que seu TBODY tem id="lista"
const loadingOverlay = document.getElementById('loadingOverlay');

// 1. AO INICIAR
window.onload = function() {
    // Tenta esconder o loading se ele existir
    if (loadingOverlay) loadingOverlay.style.display = 'none';

    try {
        const dadosLocais = localStorage.getItem('visionBlackV6');
        if (dadosLocais && dadosLocais.trim() !== "") {
            lista.innerHTML = dadosLocais;
            reativarEventos();
            atualizarTotaisGerais();
        } else {
            novoItem(); // Cria a primeira linha se estiver vazio
        }
    } catch (e) {
        console.error("Erro ao carregar:", e);
        novoItem();
    }
    
    // Tenta buscar da nuvem sem travar a tela
    buscarDaNuvem(); 
};

/* ============================================================
   FUNÇÕES PRINCIPAIS (DISPONÍVEIS NO HTML)
   ============================================================ */

// Função unificada para apagar (funciona para botão velho E novo)
function apagar(btn) { removerLinha(btn); }
function removerLinha(btn) {
    if(confirm('Tem certeza que deseja apagar esta linha?')) { 
        // Encontra a linha (TR) e remove
        const linha = btn.closest('tr');
        if(linha) {
            linha.remove(); 
            salvar(); 
            atualizarTotaisGerais(); 
        }
    }
}

// Formatação de Dinheiro
function formatarMoeda(elemento) {
    let valor = elemento.value;
    valor = valor.replace(/\D/g, ""); // Remove letras
    valor = (parseFloat(valor) / 100).toFixed(2) + ""; // Divide por 100
    valor = valor.replace(".", ","); // Vírgula decimal
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1."); // Milhar
    elemento.value = valor;
}

// Criação de Nova Linha (Com a caixa preta redimensionável)
function novoItem(retornarLinha = false) {
    // Garante que usa a tabela certa
    const tbody = document.getElementById('lista') || document.querySelector("tbody");
    
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td style="height: 1px;">
            <div class="resizable-box">
                <input type="text" placeholder="Item..." style="text-align: left;">
            </div>
        </td>
        <td style="height: 1px;">
            <div class="resizable-box">
                <input type="tel" class="qtd-input" value="1" oninput="calcular(this)">
            </div>
        </td>
        <td style="height: 1px;">
            <div class="resizable-box">
                <input type="tel" value="0,00" oninput="formatarMoeda(this); calcular(this)">
            </div>
        </td>
        <td style="height: 1px;">
            <div class="resizable-box">
                <input type="tel" value="0,00" oninput="formatarMoeda(this); calcular(this)">
            </div>
        </td>
        <td class="profit-cell">R$ 0,00</td>
        <td class="margin-cell" style="position: relative; padding-right: 35px !important;">
            0,00%
            <button class="trash-btn" onclick="removerLinha(this)" tabindex="-1">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </td>
    `;

    tbody.appendChild(tr);
    
    // Adiciona os eventos aos inputs novos
    const inputs = tr.querySelectorAll('input');
    inputs[0].addEventListener('input', function() { salvar(); });
    // Usamos addEventListener para garantir
    
    if(!retornarLinha) {
        inputs[0].focus(); // Foca no primeiro campo
        salvar();
    }
    return tr;
}

// Salva no Navegador
function salvar() {
    if(!lista) return;

    // Garante que os valores digitados fiquem no HTML para salvar
    const inputs = lista.querySelectorAll('input');
    inputs.forEach(input => input.setAttribute('value', input.value));
    
    // Salva alturas personalizadas
    const resizers = lista.querySelectorAll('.row-resizer');
    resizers.forEach(resizer => {
        if(resizer.style.height) resizer.setAttribute('style', `height:${resizer.style.height}`);
    });

    localStorage.setItem('visionBlackV6', lista.innerHTML);
    atualizarTotaisGerais();
}

// Cálculos Matemáticos
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
    if(!lista) return;
    let totalCusto = 0; let totalVenda = 0; let totalLucro = 0;
    const linhas = lista.querySelectorAll('tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        if(inputs.length >= 4) { // Proteção contra linhas quebradas
            const qtd = parseInt(inputs[1].value) || 0;
            const custoUn = lerNumero(inputs[2].value);
            const vendaUn = lerNumero(inputs[3].value);
            totalCusto += (custoUn * qtd);
            totalVenda += (vendaUn * qtd);
            totalLucro += ((vendaUn - custoUn) * qtd);
        }
    });
    
    const elCusto = document.getElementById('totalCusto');
    const elVenda = document.getElementById('totalVenda');
    const elLucro = document.getElementById('totalLucro');

    if(elCusto) elCusto.innerText = "R$ " + totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    if(elVenda) elVenda.innerText = "R$ " + totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    if(elLucro) {
        elLucro.innerText = "R$ " + totalLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        elLucro.className = 'profit-cell ' + (totalLucro >= 0 ? 'positive' : 'negative');
    }
}

// Reativa eventos ao carregar do localStorage
function reativarEventos() {
    if(!lista) return;
    const linhas = lista.querySelectorAll('tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        if(inputs.length >= 4) {
            inputs[0].oninput = function() { salvar(); };
            inputs[1].oninput = function() { calcular(this); };
            inputs[2].oninput = function() { formatarMoeda(this); calcular(this); };
            inputs[3].oninput = function() { formatarMoeda(this); calcular(this); };
        }
    });
}

function limpar() {
    if(confirm('Limpar tudo?')) {
        try{ localStorage.removeItem('visionBlackV6'); }catch(e){}
        if(lista) lista.innerHTML = ''; 
        novoItem(); 
        atualizarTotaisGerais();
    }
}

/* ============================================================
   INTEGRAÇÃO (PDF, MENU, NUVEM)
   ============================================================ */

function alternarMenu() {
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
                    
                    // Força atualização visual
                    formatarMoeda(inputs[2]);
                    formatarMoeda(inputs[3]);
                    
                    inputs.forEach(i => i.setAttribute('value', i.value));
                    calcular(inputs[1], false);
                });
                salvar();
                atualizarStatus('Sincronizado', "#4caf50");
            }
        }
    } catch (error) {
        atualizarStatus('Offline', "#9e9e9e");
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
        if(inputs.length < 4) return;
        
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
        if(response.ok) atualizarStatus('Salvo!', "#4caf50");
        else throw new Error();
    } catch (error) {
        atualizarStatus('Erro', "#f44336");
    } finally {
        if (btnSave) btnSave.disabled = false;
        setTimeout(() => { 
             const s = document.getElementById('status');
             if(s && s.innerText.includes("Salvo")) atualizarStatus('Pronto', "#858585");
        }, 4000);
    }
}

function atualizarStatus(texto, cor) {
    const s = document.getElementById('status');
    if(s) { s.innerHTML = texto; s.style.color = cor; }
}

async function gerarPDF(tipo) {
    const menu = document.getElementById("menuPDF");
    if (menu) menu.classList.remove("mostrar");

    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert("Erro: Biblioteca PDF não carregada.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // ... Código do PDF mantido igual ...
    const linhas = document.querySelectorAll('#lista tr');
    const dadosParaPDF = [];

    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
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

    if (dadosParaPDF.length === 0) { alert("Tabela vazia!"); return; }

    let colunas = [];
    if (tipo === 'completo') {
        colunas = ['PRODUTO', 'QTD', 'CUSTO', 'VENDA', 'LUCRO', 'MARGEM'];
    } else {
        colunas = ['ITEM', 'QTD', 'CONFERÊNCIA'];
    }

    doc.autoTable({
        head: [colunas],
        body: dadosParaPDF,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 40] }
    });
    doc.save("Relatorio_BlackLips.pdf");
}
