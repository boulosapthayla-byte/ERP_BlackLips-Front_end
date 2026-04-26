/**
 * BLACK LIPS ERP - Core Script
 * Sincronizado com section_hub.html
 */

// 1. FUNÇÃO DE NAVEGAÇÃO
// Garante que o clique no Breadcrumb volte para a tela principal
function voltarAoHub() {
    console.log("Tentando voltar para section_hub.html...");
    window.location.href = "section_hub.html";
}

// 2. LÓGICA DO PAINEL RETRÁTIL (ACCORDION)
// Conversa com as classes .oculto e .girar do seu CSS
function togglePainel() {
    const painel = document.getElementById('conteudo-painel');
    const seta = document.getElementById('seta-painel');
    
    if (painel && seta) {
        // Alterna a visibilidade suave (max-height e opacity no CSS)
        painel.classList.toggle('oculto');
        
        // Alterna a rotação da seta (transform no CSS)
        seta.classList.toggle('girar');
    }
}

// 3. FUNÇÕES DOS BOTÕES DE IMPORTAÇÃO
function importarEstoque() {
    console.log("Importar Pedido clicado.");
    alert("🔍 Black Lips ERP: Buscando pedidos pendentes...");
}

function importarOrdens() {
    console.log("Importar Ordens clicado.");
    alert("📦 Black Lips ERP: Sincronizando ordens de produção...");
}

// 4. ATALHOS E EVENTOS ADICIONAIS
document.addEventListener('DOMContentLoaded', () => {
    console.log("Módulo MIGO carregado com sucesso.");
});

// Atalho ESC para fechar o painel se estiver aberto
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const painel = document.getElementById('conteudo-painel');
        if (painel && !painel.classList.contains('oculto')) {
            togglePainel();
        }
    }
});
