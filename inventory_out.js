/**
 * BLACK LIPS ERP - Core Script
 * Sincronizado com inventory_out.html e section_hub.html
 */

document.addEventListener("DOMContentLoaded", function() {
    console.log("ERP Black Lips: Módulo de Inventário Conectado.");

    // 1. VINCULAR O BREADCRUMB À NAVEGAÇÃO
    // Faz com que o link "SAP Easy Access" no topo leve de volta ao Hub
    const breadcrumbLink = document.querySelector('.sap-path-link');
    if (breadcrumbLink) {
        breadcrumbLink.style.cursor = "pointer";
        breadcrumbLink.addEventListener('click', voltarAoHub);
    }
});

/* --- 2. FUNÇÃO DE NAVEGAÇÃO (VOLTAR AO HUB) --- */
function voltarAoHub() {
    console.log("Navegando para o Hub...");
    window.location.href = "section_hub.html";
}

/* --- 3. LÓGICA DO PAINEL RETRÁTIL (ACCORDION) --- */
// Esta função é chamada pelo 'onclick' que está na div 'tree-root' do seu HTML
function togglePainel() {
    const painel = document.getElementById('conteudo-painel');
    const seta = document.getElementById('seta-painel');

    if (painel && seta) {
        // Alterna a classe 'oculto' (controla altura e opacidade no seu CSS)
        painel.classList.toggle('oculto');
        
        // Alterna a classe 'girar' (controla a rotação da seta no seu CSS)
        seta.classList.toggle('girar');
    }
}

/* --- 4. FUNÇÕES DOS BOTÕES DE IMPORTAÇÃO --- */
// Chamadas pelos 'onclick' dos botões Rosa e Roxo
function importarEstoque() {
    console.log("Ação: Importar Pedido disparada.");
    alert("🔍 Black Lips ERP: Buscando pedidos pendentes no estoque...");
}

function importarOrdens() {
    console.log("Ação: Importar Ordens disparada.");
    alert("📦 Black Lips ERP: Sincronizando Ordens de Serviço...");
}

/* --- 5. ATALHOS DE TECLADO (ESTILO SAP) --- */
document.addEventListener('keydown', (e) => {
    // Atalho: Tecla ESC fecha o painel se ele estiver aberto
    if (e.key === 'Escape') {
        const painel = document.getElementById('conteudo-painel');
        if (painel && !painel.classList.contains('oculto')) {
            togglePainel();
        }
    }
    
    // Atalho: F8 (Executar no SAP) pode ser usado para gravar ou voltar
    if (e.key === 'F8') {
        e.preventDefault();
        console.log("Atalho F8 pressionado.");
    }
});
