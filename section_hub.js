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
