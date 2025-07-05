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

// Função para atualizar botões de autenticação e dashboard/logout
window.updateAuthButton = function() {
    const authButtons = document.querySelectorAll('.login-btn');
    const navLinks = document.querySelectorAll('.nav-links');
    const isDesigner = localStorage.getItem('brandge_user_role') === 'designer';
    // Remove botões antigos
    document.querySelectorAll('.dashboard-btn, .logout-btn').forEach(btn => btn.remove());
    // Botão Dashboard
    if (window.isLoggedIn && isDesigner) {
        navLinks.forEach(nav => {
            const dashBtn = document.createElement('a');
            dashBtn.textContent = 'Dashboard';
            dashBtn.className = 'dashboard-btn';
            // dashBtn.href = 'dashboard-designer.html'; // Removido pois não existe mais
            // Se necessário, pode remover completamente a criação do botão ou redirecionar para outra página
        });
    }
    // Botão Sair
    if (window.isLoggedIn) {
        navLinks.forEach(nav => {
            const logoutBtn = document.createElement('button');
            logoutBtn.textContent = 'Sair';
            logoutBtn.className = 'logout-btn';
            logoutBtn.onclick = async function() {
                await fetch('api/logout.php', { method: 'POST', credentials: 'include' });
                window.setLoginState(false);
                localStorage.removeItem('brandge_user_role');
                window.location.href = 'index.html';
            };
            nav.appendChild(logoutBtn);
        });
    }
    // Botão de login/cadastro
    const authText = window.isLoggedIn ? 'Minha conta' : 'Entrar / Cadastrar';
    const authHref = window.isLoggedIn ? 'profile.html' : 'login.html';
    authButtons.forEach(btn => {
        btn.textContent = authText;
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
// Agora consulta o backend para garantir segurança

document.addEventListener('DOMContentLoaded', function() {
    fetch('api/check-session.php', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
            if (data.logged_in) {
                window.isLoggedIn = true;
                localStorage.setItem('brandge_user_role', data.role);
            } else {
                window.isLoggedIn = false;
                localStorage.removeItem('brandge_user_role');
            }
            window.updateAuthButton();
        });
    // Redireciona ao clicar no botão de login (fallback para botões não atualizados)
    document.querySelectorAll('.login-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const authHref = window.isLoggedIn ? 'profile.html' : 'login.html';
            window.location.href = authHref;
        });
    });
});

// Ao fazer login, salve o papel do usuário:
// localStorage.setItem('brandge_user_role', 'designer'); // ou 'cliente'
