/* ============================================================
   BLACK LIPS ERP - JS BLINDADO
   ============================================================ */

const API_URL = "https://erp-blacklips-api.onrender.com"; // Placeholder
const lista = document.getElementById('lista');
const loadingOverlay = document.getElementById('loadingOverlay');

// 1. CARREGAMENTO INICIAL
window.onload = function() {
    // Esconde o loading inicialmente para não travar
    if (loadingOverlay) loadingOverlay.style.display = 'none';

    try {
        const dadosLocais = localStorage.getItem('visionBlackV6');
        if (dadosLocais && dadosLocais.trim() !== "") {
            lista.innerHTML = dadosLocais;
            reativarEventos();
            atualizarTotaisGerais();
        } else {
            novoItem(); // Se estiver vazio, cria uma linha
        }
    } catch (e) {
        console.error(e);
        novoItem();
    }
    
    // Tenta buscar da nuvem em segundo plano
    buscarDaNuvem(); 
};

// 2. FUNÇÕES GLOBAIS (Para o HTML acessar)
window.novoItem = novoItem;
window.apagar = removerLinha; // Redireciona 'apagar' para 'removerLinha'
window.removerLinha = removerLinha;
window.salvar = salvar;
window.formatarMoeda = formatarMoeda;
window.calcular = calcular;
window.alternarMenu = alternarMenu;
window.gerarPDF = gerarPDF;
window.enviarParaNuvem = enviarParaNuvem;
window.limpar = limpar;

/* --- LÓGICA DE CRIAÇÃO DE LINHAS (COMPATÍVEL COM CSS) --- */
function novoItem(retornarLinha = false) {
    const tbody = document.getElementById('lista');
    if (!tbody) return;

    const tr = document.createElement("tr");

    // HTML ESTRUTURADO COM 'resizable-box'
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
    
    // Adiciona eventos de salvamento automático
    const inputs = tr.querySelectorAll('input');
    inputs[0].addEventListener('input', salvar);

    if(!retornarLinha) {
        inputs[0].focus();
        salvar();
    }
    return tr;
}

function removerLinha(btn) {
    if(confirm('Tem certeza que deseja apagar?')) {
        const linha = btn.closest('tr');
        if(linha) linha.remove();
        salvar();
        atualizarTotaisGerais();
    }
}

/* --- CÁLCULOS E FORMATAÇÃO --- */
function formatarMoeda(elemento) {
    let valor = elemento.value.replace(/\D/g, "");
    valor = (parseFloat(valor) / 100).toFixed(2) + "";
    valor = valor.replace(".", ",");
    valor = valor.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    elemento.value = valor;
}

function lerNumero(val) {
    if (!val) return 0;
    val = String(val);
    if (val.includes(',')) val = val.replace(/\./g, '').replace(',', '.');
    return parseFloat(val) || 0;
}

function calcular(input) {
    const tr = input.closest('tr');
    const inputs = tr.querySelectorAll('input');
    
    // Atualiza atributo value para salvar no HTML
    input.setAttribute('value', input.value);

    const qtd = parseInt(inputs[1].value) || 0;
    const custo = lerNumero(inputs[2].value);
    const venda = lerNumero(inputs[3].value);
    
    const profitCell = tr.querySelector('.profit-cell');
    const marginCell = tr.querySelector('.margin-cell');

    if (venda === 0) {
        profitCell.innerText = "R$ 0,00";
        marginCell.innerText = "0,00%";
        profitCell.className = 'profit-cell';
        marginCell.className = 'margin-cell';
    } else {
        const lucro = (venda - custo) * qtd;
        const margem = ((venda - custo) / venda) * 100;

        profitCell.innerText = "R$ " + lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
        marginCell.innerText = margem.toFixed(2).replace('.', ',') + "%";

        profitCell.className = 'profit-cell ' + (lucro < 0 ? 'negative' : 'positive');
        
        let mClass = 'positive';
        if(margem < 0) mClass = 'negative';
        else if(margem < 30) mClass = 'neutral';
        marginCell.className = 'margin-cell ' + mClass;
    }
    salvar();
}

function atualizarTotaisGerais() {
    let tCusto = 0, tVenda = 0, tLucro = 0;
    const linhas = document.querySelectorAll('#lista tr');
    
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        if(inputs.length >= 4) {
            const qtd = parseInt(inputs[1].value) || 0;
            const custo = lerNumero(inputs[2].value);
            const venda = lerNumero(inputs[3].value);
            tCusto += custo * qtd;
            tVenda += venda * qtd;
            tLucro += (venda - custo) * qtd;
        }
    });

    document.getElementById('totalCusto').innerText = "R$ " + tCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    document.getElementById('totalVenda').innerText = "R$ " + tVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    const elLucro = document.getElementById('totalLucro');
    elLucro.innerText = "R$ " + tLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    elLucro.className = 'profit-cell ' + (tLucro >= 0 ? 'positive' : 'negative');
}

function salvar() {
    const inputs = document.querySelectorAll('#lista input');
    inputs.forEach(i => i.setAttribute('value', i.value));
    
    // Salva a altura das linhas (resize)
    const resizers = document.querySelectorAll('.row-resizer');
    resizers.forEach(r => {
        if(r.style.height) r.setAttribute('style', `height:${r.style.height}`);
    });

    localStorage.setItem('visionBlackV6', lista.innerHTML);
    atualizarTotaisGerais();
}

function reativarEventos() {
    const linhas = document.querySelectorAll('#lista tr');
    linhas.forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        if(inputs.length >= 4) {
            inputs[0].addEventListener('input', salvar);
            inputs[1].addEventListener('input', function(){ calcular(this) });
            inputs[2].addEventListener('input', function(){ formatarMoeda(this); calcular(this) });
            inputs[3].addEventListener('input', function(){ formatarMoeda(this); calcular(this) });
        }
    });
}

function limpar() {
    if(confirm('Limpar toda a tabela?')) {
        localStorage.removeItem('visionBlackV6');
        lista.innerHTML = '';
        novoItem();
        atualizarTotaisGerais();
    }
}

/* --- PDF, MENU E NUVEM --- */
function alternarMenu() {
    const menu = document.getElementById("menuPDF");
    if(menu) menu.classList.toggle("mostrar");
}

window.onclick = function(e) {
    if (!e.target.closest('.dropdown-container')) {
        const menu = document.getElementById("menuPDF");
        if (menu && menu.classList.contains('mostrar')) menu.classList.remove('mostrar');
    }
}

async function buscarDaNuvem() {
    // Placeholder - Adicione lógica do Firebase aqui quando tiver as chaves
    console.log("Tentando conectar nuvem...");
}

async function enviarParaNuvem() {
    const btn = document.querySelector('.btn-save');
    if(btn) {
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
        setTimeout(() => {
            btn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Salvar';
            alert('Configuração de nuvem pendente (Falta Firebase Config). Dados salvos localmente.');
        }, 1000);
    }
}

async function gerarPDF(tipo) {
    const menu = document.getElementById("menuPDF");
    if (menu) menu.classList.remove("mostrar");

    if (!window.jspdf) { alert("Erro na biblioteca PDF"); return; }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    const dados = [];
    document.querySelectorAll('#lista tr').forEach(tr => {
        const inputs = tr.querySelectorAll('input');
        if(inputs.length >= 2 && inputs[0].value.trim() !== "") {
            const prod = inputs[0].value.toUpperCase();
            const qtd = inputs[1].value;
            if(tipo === 'completo') {
                dados.push([prod, qtd, inputs[2].value, inputs[3].value, 
                           tr.querySelector('.profit-cell').innerText, 
                           tr.querySelector('.margin-cell').innerText]);
            } else {
                dados.push([prod, qtd, "[ ] CONFERIDO"]);
            }
        }
    });

    if(dados.length === 0) { alert("Tabela vazia!"); return; }

    doc.autoTable({
        head: [tipo === 'completo' ? ['ITEM', 'QTD', 'CUSTO', 'VENDA', 'LUCRO', 'MARGEM'] : ['ITEM', 'QTD', 'CONFERÊNCIA']],
        body: dados,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [40, 40, 40] }
    });
    doc.save("Relatorio_ERP.pdf");
}
