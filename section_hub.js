/* ============================================================
   LÓGICA DO HUB SAP (section_hub.js)
   ============================================================ */

/* 1. FUNÇÃO PARA ABRIR APPS (Como a Matriz de Preço) */
function abrirApp(url) {
    // Busca o elemento iframe que está escondido no HTML
    const iframe = document.getElementById('fullscreen-app');
    
    if (iframe) {
        // Se o iframe existir, carrega a URL nele
        iframe.src = url;
        // E mostra ele na tela toda
        iframe.style.display = 'block';
    } else {
        // Segurança: Se por algum motivo o iframe não existir, abre na mesma janela
        window.location.href = url;
    }
}

/* 2. FUNÇÃO PARA FECHAR O APP (Botão Voltar) */
function fecharApp() {
    const iframe = document.getElementById('fullscreen-app');
    if (iframe) {
        iframe.style.display = 'none';
        iframe.src = ''; // Limpa a memória
    }
}

/* 3. FUNÇÃO PARA NAVEGAR NOS MENUS LATERAIS (Favoritos, Custos, etc) */
function openScreen(screenId, title) {
    // Esconde todas as telas de conteúdo
    const screens = document.querySelectorAll('.screen-content');
    screens.forEach(el => el.style.display = 'none');
    
    // Mostra apenas a tela que foi clicada (ex: screen-home ou screen-custos)
    const target = document.getElementById('screen-' + screenId);
    if (target) {
        target.style.display = 'block';
        
        // Adiciona a classe para centralizar se for a Home
        if (screenId === 'home') target.classList.add('center-content');
        else target.classList.remove('center-content');
    }
    
    // Atualiza o Título lá no topo (Cabeçalho cinza)
    const titleEl = document.getElementById('header-title');
    if (titleEl) titleEl.innerText = title;
}

/* 4. DISPONIBILIZAR AS FUNÇÕES PARA O HTML (Importante!) */
window.abrirApp = abrirApp;
window.fecharApp = fecharApp;
window.openScreen = openScreen;
