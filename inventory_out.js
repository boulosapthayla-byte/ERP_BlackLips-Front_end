/**
 * BLACK LIPS ERP - Core Script (Z_BLACK_LIPS_MIGO)
 * Dev: Thayla
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log("ERP Black Lips: Módulo de Inventário Carregado.");
    
    // Inicia os contadores dos badges
    atualizarContadores();

    // 1. LÓGICA DE NAVEGAÇÃO DO BREADCRUMB (No JS)
    // Se você clicar no "SAP Easy Access" no breadcrumb, ele volta ao Hub
    const breadLink = document.querySelector('.sap-path-link');
    if (breadLink) {
        breadLink.addEventListener('click', voltarAoHub);
    }
});

/* --- FUNÇÃO DE NAVEGAÇÃO --- */
function voltarAoHub() {
    // Redireciona o navegador de volta para a tela principal (Seu Arq 1)
    window.location.href = "section_hub.html";
}

// 2. LÓGICA DO PAINEL RETRÁTIL (Sincronizado com seu CSS)
function togglePainel() {
    const painel = document.getElementById('conteudo-painel');
    const seta = document.getElementById('seta-painel');
    
    if (painel && seta) {
        // Usa as classes 'oculto' e 'girar' do seu CSS
        painel.classList.toggle('oculto');
        seta.classList.toggle('girar');
    }
}

// 3. FUNÇÕES DE IMPORTAÇÃO (Botões Rosa e Roxo)
function importarEstoque() {
    console.log("Iniciando importação de Pedido...");
    alert("🔍 Buscando pedidos pendentes na base de dados...");
}

function importarOrdens() {
    console.log("Iniciando importação de Ordens...");
    alert("📦 Sincronizando Ordens de Produção...");
}

// 4. UTILITÁRIOS E ATALHOS
function atualizarContadores() {
    const est = document.getElementById('num-estoque');
    const ord = document.getElementById('num-ordens');
    if(est) est.innerText = "3"; 
    if(ord) ord.innerText = "5";
}

// Atalhos de teclado (Conforme seu pedido de correções anteriores)
document.addEventListener('keydown', (e) => {
    // Esc para fechar o painel
    if (e.key === 'Escape') {
        const painel = document.getElementById('conteudo-painel');
        if (painel && !painel.classList.contains('oculto')) {
            togglePainel();
        }
    }
});
