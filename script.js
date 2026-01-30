const API_URL = "https://erp-blacklips-api.onrender.com";
const lista = document.getElementById('lista');
const loadingOverlay = document.getElementById('loadingOverlay');

window.onload = function() {
    loadingOverlay.style.display = 'flex';
    try {
        const dadosLocais = localStorage.getItem('visionBlackV6');
        if(dadosLocais && dadosLocais.trim() !== "") {
            lista.innerHTML = dadosLocais;
            reativarEventos();
            atualizarTotaisGerais();
        } else {
            novoItem();
        }
    } catch (e) { novoItem(); }
    buscarDaNuvem(); 
};

window.novoItem = novoItem;
window.apagar = apagar;
window.salvar = salvar;
window.enviarParaNuvem = enviarParaNuvem;
window.baixarPDF = baixarPDF;
window.limpar = limpar;
window.calcular = calcular;

function salvar() {
    const inputs = lista.querySelectorAll('input');
    inputs.forEach(input => input.setAttribute('value', input.value));
    
    // Salva também o estilo (tamanho) das caixas redimensionadas
    const boxes = lista.querySelectorAll('.resizable-box');
    boxes.forEach(box => {
        if(box.style.width) box.setAttribute('style', `width:${box.style.width}; height:${box.style.height}`);
    });

    try { localStorage.setItem('visionBlackV6', lista.innerHTML); } catch (e) {}
    atualizarStatus('<i class="fa-solid fa-floppy-disk"></i> Salvo Local', "#ffb74d");
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
        loadingOverlay.style.display = 'none';
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

// --- FUNÇÃO CRÍTICA ATUALIZADA: CRIA AS CAIXAS DE RESIZE ---
function novoItem(retornarElemento = false) {
    const tr = document.createElement('tr');
    
    tr.innerHTML = `
        <td>
            <div class="resizable-box">
                <input type="text" oninput="salvar()">
            </div>
        </td>
        <td>
            <div class="resizable-box">
                <input type="tel" value="1" class="qtd-input" oninput="calcular(this)">
            </div>
        </td>
        <td>
            <div class="resizable-box">
                <input type="tel" placeholder="0,00" oninput="calcular(this)">
            </div>
        </td>
        <td>
            <div class="resizable-box">
                <input type="tel" placeholder="0,00" oninput="calcular(this)">
            </div>
        </td>
        <td class="profit-cell">R$ 0,00</td>
        <td class="margin-cell" style="text-align: right;">0,00%</td>
        <td style="text-align: center;">
            <button class="trash-btn" onclick="apagar(this)"><i class="fa-solid fa-xmark"></i></button>
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

async function baixarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');
    const el = document.getElementById('printArea');
    const originalBg = el.style.background;
    el.style.background = "#fff"; el.style.color = "#000";
    el.querySelectorAll('input').forEach(i => i.style.color = "#000");
    el.querySelectorAll('.trash-btn, .btn-add-row').forEach(b => b.style.display = 'none');
    el.querySelector('tfoot').style.background = "#ddd";
    await html2canvas(el, { scale: 2 }).then(canvas => {
        const img = canvas.toDataURL('image/png');
        const w = doc.internal.pageSize.getWidth() - 40;
        const h = (canvas.height * w) / canvas.width;
        doc.addImage(img, 'PNG', 20, 40, w, h);
        doc.save("Relatorio_BlackLips.pdf");
    });
    el.style.background = originalBg; el.style.color = "";
    el.querySelectorAll('input').forEach(i => i.style.color = "");
    el.querySelectorAll('.trash-btn, .btn-add-row').forEach(b => b.style.display = "");
    el.querySelector('tfoot').style.background = "";
}
