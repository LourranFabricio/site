// Estado do menu mobile
let isMobileMenuOpen = false;

// Verifica se a tela está em modo mobile (abaixo de 959px de largura)
function isMobileScreen() {
    return window.innerWidth <= 959;
}

// Função para alternar o menu mobile – só funciona em telas menores
function toggleMobileMenu() {
    // Só permite o menu mobile se a tela for pequena
    if (!isMobileScreen()) {
        return;
    }

    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    // Inverte o estado atual do menu
    isMobileMenuOpen = !isMobileMenuOpen;

    if (isMobileMenuOpen) {
        // Exibe o menu e troca o ícone para "fechar"
        mobileMenu.style.display = 'block';
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
    } else {
        // Esconde o menu e volta para o ícone de "menu"
        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
    }
}

// Função para rolar suavemente até uma seção
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start'      
        });
    }

    // Fecha o menu mobile após o clique, se estiver aberto
    if (isMobileMenuOpen && isMobileScreen()) {
        toggleMobileMenu();
    }
}

// Redimensiona tela para garantir o comportamento do menu
window.addEventListener('resize', function() {
    // Se a tela virar desktop e o menu mobile estiver aberto, fecha o menu
    if (!isMobileScreen() && isMobileMenuOpen) {
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');
        const closeIcon = document.getElementById('close-icon');

        mobileMenu.style.display = 'none';
        menuIcon.style.display = 'block';
        closeIcon.style.display = 'none';
        isMobileMenuOpen = false;
    }
});

// Fecha o menu mobile ao clicar fora dele
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    if (isMobileMenuOpen && 
        !mobileMenu.contains(event.target) && 
        !mobileMenuButton.contains(event.target)) {
        toggleMobileMenu();
    }
});


//Variável global para o estado de autenticação
window.isLoggedIn = false;

// Atualiza o texto e link dos botões de autenticação
window.updateAuthButton = function() {
    const authButtons = document.querySelectorAll('.login-btn');
    const authText = window.isLoggedIn ? 'Minha conta' : 'Entrar / Cadastrar';
    const authHref = window.isLoggedIn ? 'profile.html' : 'login.html';
    authButtons.forEach(btn => {
        btn.textContent = authText;
        // Sempre define o onclick para garantir o redirecionamento correto
        btn.onclick = function(e) {
            e.preventDefault();
            window.location.href = authHref;
        };
        
        if (btn.tagName === 'A') {
            btn.setAttribute('href', authHref);
        }
    });
};

// Função global para alterar o estado de login
window.setLoginState = function(state) {
    window.isLoggedIn = Boolean(state);
    window.updateAuthButton();
    localStorage.setItem('brandge_auth_state', JSON.stringify(window.isLoggedIn));
};

// Inicializa o estado de login ao carregar a página
document.addEventListener('DOMContentLoaded', function() {
    // Recupera do localStorage
    const savedAuthState = localStorage.getItem('brandge_auth_state');
    if (savedAuthState !== null) {
        window.isLoggedIn = JSON.parse(savedAuthState);
    }
    window.updateAuthButton();

    // Redireciona ao clicar no botão de login (fallback para botões não atualizados)
    document.querySelectorAll('.login-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const authHref = window.isLoggedIn ? 'profile.html' : 'login.html';
            window.location.href = authHref;
        });
    });
});
