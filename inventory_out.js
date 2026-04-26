/**
 * BLACK LIPS ERP - Core Script (Z_BLACK_LIPS_MIGO)
 * Dev: Thayla
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("ERP Black Lips: Módulo de Inventário Carregado.");
    
    // Inicia os badges com valores padrão
    atualizarContadores();

    // Lógica para navegação de itens (caso você adicione uma lista lateral depois)
    const itens = document.querySelectorAll('.tree-item');
    itens.forEach(item => {
        item.addEventListener('click', function(e) {
            if (e.target.type !== 'checkbox') {
                const meuCheckbox = this.querySelector('input[type="checkbox"]');
                if (meuCheckbox) meuCheckbox.checked = true;
            }

            itens.forEach(outroItem => {
                if (outroItem !== this) {
                    outroItem.classList.remove('active');
                    const outroCheck = outroItem.querySelector('input[type="checkbox"]');
                    if (outroCheck) outroCheck.checked = false;
                }
            });
            
            this.classList.add('active');
        });
    });
});

// 1. LÓGICA DO PAINEL RETRÁTIL (Exatamente como o seu CSS pede)
function togglePainel() {
    const painel = document.getElementById('conteudo-painel');
    const seta = document.getElementById('seta-painel');
    
    if (painel && seta) {
        // Toggle da classe 'oculto' para o max-height e opacity no CSS
        painel.classList.toggle('oculto');
        // Toggle da classe 'girar' para o transform: rotate no CSS
        seta.classList.toggle('girar');
    }
}

// 2. FUNÇÕES DE NAVEGAÇÃO
function voltarAoHub() {
    window.location.href = "section_hub.html";
}

// 3. FUNÇÕES DE IMPORTAÇÃO (Botões Rosa e Roxo)
function importarEstoque() {
    console.log("Iniciando importação de Pedidos...");
    alert("🔍 Buscando pedidos pendentes na base de dados...");
}

function importarOrdens() {
    console.log("Iniciando importação de Ordens...");
    alert("📦 Sincronizando Ordens de Produção...");
}

// 4. LÓGICA DE GRAVAÇÃO (Para o botão principal da tela)
function gravarRegistro() {
    const inputs = document.querySelectorAll('.sap-input');
    // Verifica se o primeiro input (geralmente código) está preenchido
    if (inputs.length > 0 && inputs[0].value === "") {
        alert("❌ Erro: Preencha os campos obrigatórios.");
        return;
    }

    alert(`✅ Sucesso: Lançamento gravado no sistema.`);
}

// 5. UTILITÁRIOS
function atualizarContadores() {
    const est = document.getElementById('num-estoque');
    const ord = document.getElementById('num-ordens');
    if(est) est.innerText = "3"; // Valores iniciais
    if(ord) ord.innerText = "5";
}

// Atalhos de teclado (Estilo SAP)
document.addEventListener('keydown', (e) => {
    // F8 para gravar (Executar no SAP)
    if (e.key === 'F8') {
        e.preventDefault();
        gravarRegistro();
    }
    // Esc para fechar o painel se ele estiver aberto
    if (e.key === 'Escape') {
        const painel = document.getElementById('conteudo-painel');
        if (painel && !painel.classList.contains('oculto')) {
            togglePainel();
        }
    }
});
