// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
    const cardsContainer = document.getElementById('cards-container');
    const searchInputDesktop = document.getElementById('search-input-desktop');
    const searchInputMobile = document.getElementById('search-input-mobile');
    const authButton = document.getElementById('auth-button');
    const authButtonMobile = document.getElementById('auth-button-mobile');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    // Simula dados de parceiros vindos do backend
    const partners = [
        {
            id: 1,
            name: 'Secret Idea Studio',
            specialty: 'Design Gráfico',
            image: 'assets/img/SECRET_IDEA_STUDIO_Card.png'
        },
        {
            id: 2,
            name: 'Fabricio Lourran',
            specialty: 'Branding e Identidade Visual',
            image: 'assets/img/Fabricio_Lourran_Card.png'
        },
        {
            id: 3,
            name: 'Creative Minds Agency',
            specialty: 'Ilustração e Animeção',
            image: 'assets/img/SECRET_IDEA_STUDIO_Card.png'
        },
        {
            id: 4,
            name: 'Pixel Perfect Studio',
            specialty: 'Web Design e UI/UX',
            image: 'assets/img/glass_door.png'
        },
        {
            id: 5,
            name: 'Artistic Touch Co.',
            specialty: 'Marketing Digital',
            image: 'assets/img/glass_door.png'
        },
        {
            id: 6,
            name: 'Brand Builders Inc.',
            specialty: 'Consultoria de Marca',
            image: 'assets/img/glass_door.png'
        }
    ];

    // Renderiza os parceiros na tela (com ou sem filtro)
    function renderPartners(filter = '') {
        cardsContainer.innerHTML = '';

        const filteredPartners = partners.filter(partner =>
            partner.name.toLowerCase().includes(filter.toLowerCase()) ||
            partner.specialty.toLowerCase().includes(filter.toLowerCase())
        );

        if (filteredPartners.length === 0) {
            cardsContainer.innerHTML = '<p style="color: #6b6b6b; font-size: 1.2em; grid-column: 1 / -1;">Nenhum parceiro encontrado.</p>';
            return;
        }

        filteredPartners.forEach(partner => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${partner.image}" alt="${partner.name}" onerror="this.src='https://via.placeholder.com/300x250/CCCCCC/666666?text=Imagem+Indisponível'">
                <div class="card-info">
                    <h3 class="card-name">${partner.name}</h3>
                    <p class="card-specialty">${partner.specialty}</p>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    // Renderiza os parceiros ao carregar a página
    renderPartners();

    // Função de busca
    function handleSearch(searchValue) {
        renderPartners(searchValue);

        // Sincroniza os campos de busca desktop e mobile
        if (searchInputDesktop.value !== searchValue) {
            searchInputDesktop.value = searchValue;
        }
        if (searchInputMobile.value !== searchValue) {
            searchInputMobile.value = searchValue;
        }
    }

    // Escutando eventos de digitação nos campos de busca
    searchInputDesktop.addEventListener('input', (e) => handleSearch(e.target.value));
    searchInputMobile.addEventListener('input', (e) => handleSearch(e.target.value));


    // Usa a função global para atualizar botões de autenticação
    if (window.updateAuthButton) {
        window.updateAuthButton();
    }

    // Rola suavemente até uma seção específica da página (por âncora)
    function scrollToSection(sectionId) {
        window.location.href = `/#${sectionId}`;
    }

    // Deixa a função acessível globalmente
    window.scrollToSection = scrollToSection;

    // Inicializa verificação de login
    checkAuthState();

    // Fecha o menu mobile ao clicar fora dele
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            if (mobileMenu.classList.contains('show')) {
                toggleMobileMenu();
            }
        }
    });

    // Fecha o menu mobile ao redimensionar para desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 960 && mobileMenu.classList.contains('show')) {
            toggleMobileMenu();
        }
    });

    // Simula funções de integração com backend
    window.partnersAPI = {
        async fetchPartners() {
            // Em produção, isso deve buscar do backend
            return partners;
        },
        async searchPartners(query) {
            return partners.filter(partner =>
                partner.name.toLowerCase().includes(query.toLowerCase()) ||
                partner.specialty.toLowerCase().includes(query.toLowerCase())
            );
        },
        async getPartner(id) {
            return partners.find(partner => partner.id === id);
        }
    };

    // Mensagem no console para desenvolvedores
    console.log('Partners page loaded successfully');
    console.log('Available functions: toggleLoginState(), setLoginState(state), partnersAPI');
});

// Redireciona ao clicar no botão com classe "login-btn"
document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.login-btn');

    if (loginButton) {
        loginButton.addEventListener('click', function() {
            window.location.href = 'login.html'; // Caminho do arquivo de login
        });
    }
});
