function openScreen(screenId, title) {
    // 1. Esconde todas as telas
    document.querySelectorAll('.screen-content').forEach(el => el.classList.remove('active-screen'));
    
    // 2. Mostra a tela certa
    const target = document.getElementById('screen-' + screenId);
    if(target) target.classList.add('active-screen');

    // 3. Atualiza o Título e o Input de Comando
    if(title) {
        document.getElementById('header-title').innerText = title;
        document.getElementById('cmd-input').value = "/n " + title;
    }
}

/* === LÓGICA DE ABRIR/FECHAR APP (SIMPLES) === */

// Certifique-se que seu HTML tem uma div com id="hub-wrapper" envolvendo tudo
// e um iframe com id="fullscreen-app"
const hubWrapper = document.getElementById('hub-wrapper'); 
const appFrame = document.getElementById('fullscreen-app'); 

// Função para abrir o App (Isso esconde o Hub e mostra o iframe)
function abrirApp(url) {
    if(hubWrapper && appFrame) {
        hubWrapper.style.display = 'none'; // Esconde o Hub
        appFrame.style.display = 'block';  // Mostra o Iframe
        appFrame.src = url;                // Carrega o site (ex: margin_analysis.html)
    } else {
        console.error("ERRO: Faltam as IDs 'hub-wrapper' ou 'fullscreen-app' no seu HTML!");
        // Fallback: Se não achar as divs, abre normal
        window.location.href = url;
    }
}

// Função que o App vai chamar para se fechar
// (Essa função fica disponível para o iframe usar)
window.fecharAppDoHub = function() {
    if(hubWrapper && appFrame) {
        appFrame.style.display = 'none';   // Esconde o Iframe
        appFrame.src = '';                 // Limpa a memória
        hubWrapper.style.display = 'flex'; // Traz o Hub de volta (use 'block' ou 'flex' conforme seu layout)
    }
}
