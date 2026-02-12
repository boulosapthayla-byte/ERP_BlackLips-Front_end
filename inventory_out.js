/* --- FUNÇÃO DE NAVEGAÇÃO --- */
function voltarAoHub() {
    window.location.href = "section_hub.html";
}

document.addEventListener("DOMContentLoaded", function() {
    
    // 1. LÓGICA DE ABRIR/FECHAR PASTAS (Setinha)
    const pastas = document.querySelectorAll('.tree-root');

    pastas.forEach(pasta => {
        pasta.addEventListener('click', () => {
            const conteudo = pasta.nextElementSibling;
            const icone = pasta.querySelector('i');

            if (conteudo) {
                if (conteudo.style.display === 'none') {
                    conteudo.style.display = 'block';
                    icone.classList.remove('fa-caret-right');
                    icone.classList.add('fa-caret-down');
                } else {
                    conteudo.style.display = 'none';
                    icone.classList.remove('fa-caret-down');
                    icone.classList.add('fa-caret-right');
                }
            }
        });
    });

    // 2. LÓGICA DO MENU LATERAL (SELEÇÃO ROSA + CHECKBOX)
    const itens = document.querySelectorAll('.tree-item');

    itens.forEach(item => {
        item.addEventListener('click', function(e) {
            
            // Se clicou no texto, marca o checkbox automaticamente
            if (e.target.type !== 'checkbox') {
                const meuCheckbox = this.querySelector('input[type="checkbox"]');
                if (meuCheckbox) meuCheckbox.checked = true;
            }

            // Limpa a seleção de TODOS os outros itens
            itens.forEach(outroItem => {
                if (outroItem !== this) {
                    outroItem.classList.remove('active'); // Tira o rosa
                    const outroCheck = outroItem.querySelector('input[type="checkbox"]');
                    if (outroCheck) outroCheck.checked = false; // Desmarca
                }
            });
            
            // Ativa o atual (Rosa)
            this.classList.add('active');
            
            // Garante que o checkbox visualmente fique marcado
            const check = this.querySelector('input[type="checkbox"]');
            if(check) check.checked = true;
        });
    });

});

/* --- FUNÇÃO DE NAVEGAÇÃO --- */

function voltarAoHub() {
    // Redireciona o navegador de volta para a tela principal
    window.location.href = "section_hub.html";
}
