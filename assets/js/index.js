// Fecha o menu mobile ao redimensionar a janela para desktop
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768 && window.isMobileMenuOpen) {
        toggleMobileMenu(); // Fecha o menu se for maior que 768px e estiver aberto
    }
});

// Adiciona rolagem suave para todos os links âncora
document.addEventListener('DOMContentLoaded', function() {
    // Garante que a rolagem suave esteja habilitada
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Adiciona efeitos de hover aos botões
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (button.classList.contains('btn-hover')) {
            // Efeito ao passar o mouse por cima
            button.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 10px 25px rgba(24, 24, 24, 0.2)';
            });
            
            // Efeito ao remover o mouse
            button.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = 'none';
            });
        }
    });

    // Adiciona efeitos de hover aos cartões do carrossel
    const carouselCards = document.querySelectorAll('.carousel-card');
    carouselCards.forEach(card => {
        // Efeito ao passar o mouse por cima do card
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });

        // Efeito ao remover o mouse do card
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        });
    });
});

// Configurações do Intersection Observer para animações
const indexObserverOptions = {
    threshold: 0.1, // Quando 10% do elemento estiver visível
    rootMargin: '0px 0px -50px 0px' // Margem de disparo da animação
};

// Criação do observer para detectar quando os elementos entram na tela
const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Ativa a animação de fade-in
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, indexObserverOptions);

// Observa as seções da página para ativar a animação ao rolar
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        // Define o estado inicial oculto e deslocado
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';

        // Inicia a observação da seção
        observer.observe(section);
    });  
});
