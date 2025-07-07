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

    let designers = [];
    let filteredDesigners = [];
    let selectedCardIndex = null;
    // Índice atual do carrossel para cada designer
    const carouselIndexes = {};

    // Função utilitária para parsing seguro de JSON
    async function safeJsonResponse(response) {
        const text = await response.text();
        try {
            return JSON.parse(text);
        } catch (e) {
            alert('Erro inesperado do servidor. Tente atualizar a página.');
            console.error('Resposta não-JSON recebida:', text);
            return { success: false, error: 'Resposta inválida do servidor' };
        }
    }

    // Função para buscar designers do backend
    async function fetchDesigners() {
        try {
            const res = await fetch('api/list-designers.php');
            const data = await safeJsonResponse(res);
            if (data.success) {
                designers = data.designers.filter(d => d.portfolio && d.portfolio.length > 0);
                filteredDesigners = designers;
                renderDesigners();
            } else {
                cardsContainer.innerHTML = '<p style="color: #6b6b6b; font-size: 1.2em; grid-column: 1 / -1;">Erro ao carregar parceiros.</p>';
            }
        } catch (e) {
            cardsContainer.innerHTML = '<p style="color: #6b6b6b; font-size: 1.2em; grid-column: 1 / -1;">Erro de conexão ao carregar parceiros.</p>';
        }
    }

    // Função para renderizar os designers
    function renderDesigners() {
        cardsContainer.innerHTML = '';
        if (filteredDesigners.length === 0) {
            cardsContainer.innerHTML = '<p style="color: #6b6b6b; font-size: 1.2em; grid-column: 1 / -1;">Nenhum parceiro encontrado.</p>';
            return;
        }
        filteredDesigners.forEach((designer, idx) => {
            // Inicializa o índice do carrossel para cada designer
            if (!(designer.id in carouselIndexes)) {
                carouselIndexes[designer.id] = 0;
            }
            const card = document.createElement('div');
            card.classList.add('card');
            if (selectedCardIndex === idx) card.classList.add('selected');
            // Carousel de imagens do portfólio
            let portfolioHtml = '';
            if (designer.portfolio.length > 1) {
                portfolioHtml = `
                    <div class="designer-carousel" data-idx="${idx}" style="position:relative;">
                        <button class="carousel-arrow left" aria-label="Imagem anterior" style="position:absolute;top:50%;left:10px;transform:translateY(-50%);z-index:2;background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:1.5em;cursor:pointer;">&#8592;</button>
                        <img src="${designer.portfolio[carouselIndexes[designer.id]]}" alt="Portfólio de ${designer.name}" class="designer-portfolio">
                        <button class="carousel-arrow right" aria-label="Próxima imagem" style="position:absolute;top:50%;right:10px;transform:translateY(-50%);z-index:2;background:rgba(0,0,0,0.4);color:#fff;border:none;border-radius:50%;width:36px;height:36px;font-size:1.5em;cursor:pointer;">&#8594;</button>
                    </div>`;
            } else {
                portfolioHtml = `<img src="${designer.portfolio[0]}" alt="Portfólio de ${designer.name}" class="designer-portfolio">`;
            }
            // Especialidades como tags
            const specialtiesHtml = designer.specialties.map(s => `<span class="tag">${s}</span>`).join(' ');
            // Contato
            let contactHtml = '';
            if (selectedCardIndex === idx) {
                contactHtml = `<div class="designer-contact" style="margin-top:12px;">
                    <strong>Contato:</strong><br>
                    <span style="display:inline-block;margin:2px 0;">📧 <a href='mailto:${designer.email}'>${designer.email}</a></span><br>
                    <span style="display:inline-block;margin:2px 0;">📱 ${designer.phone ? designer.phone : 'Não informado'}</span>
                </div>`;
            }
            card.innerHTML = `
                ${portfolioHtml}
                <div class="card-info">
                    <h3 class="card-name">${designer.name}</h3>
                    <div class="card-specialty">${specialtiesHtml}</div>
                    ${contactHtml}
                </div>
            `;
            card.addEventListener('click', () => {
                // Apenas alterna a seleção do card, sem re-renderizar tudo
                if (selectedCardIndex === idx) {
                    selectedCardIndex = null; // Deseleciona se já estava selecionado
                } else {
                    selectedCardIndex = idx; // Seleciona o novo card
                }
                // Atualiza apenas a classe 'selected' e as informações de contato
                document.querySelectorAll('.card').forEach((card, cardIdx) => {
                    if (cardIdx === selectedCardIndex) {
                        card.classList.add('selected');
                        // Adiciona informações de contato se não existirem
                        if (!card.querySelector('.designer-contact')) {
                            const contactDiv = document.createElement('div');
                            contactDiv.className = 'designer-contact';
                            contactDiv.style.marginTop = '12px';
                            contactDiv.innerHTML = `
                                <strong>Contato:</strong><br>
                                <span style="display:inline-block;margin:2px 0;">📧 <a href='mailto:${designer.email}'>${designer.email}</a></span><br>
                                <span style="display:inline-block;margin:2px 0;">📱 ${designer.phone ? designer.phone : 'Não informado'}</span>
                            `;
                            card.querySelector('.card-info').appendChild(contactDiv);
                        }
                    } else {
                        card.classList.remove('selected');
                        // Remove informações de contato
                        const contactDiv = card.querySelector('.designer-contact');
                        if (contactDiv) {
                            contactDiv.remove();
                        }
                    }
                });
            });
            card.addEventListener('mouseenter', () => card.classList.add('hovered'));
            card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
            cardsContainer.appendChild(card);
        });
        // Carousel funcionalidade
        document.querySelectorAll('.designer-carousel').forEach((carousel) => {
            const idx = parseInt(carousel.dataset.idx, 10);
            const designer = filteredDesigners[idx];
            if (!designer || !designer.portfolio.length) return;
            const img = carousel.querySelector('img');
            const left = carousel.querySelector('.carousel-arrow.left');
            const right = carousel.querySelector('.carousel-arrow.right');
            left.addEventListener('click', (e) => {
                e.stopPropagation();
                if (designer.portfolio.length > 1) {
                    carouselIndexes[designer.id] = (carouselIndexes[designer.id] - 1 + designer.portfolio.length) % designer.portfolio.length;
                    img.src = designer.portfolio[carouselIndexes[designer.id]];
                }
            });
            right.addEventListener('click', (e) => {
                e.stopPropagation();
                if (designer.portfolio.length > 1) {
                    carouselIndexes[designer.id] = (carouselIndexes[designer.id] + 1) % designer.portfolio.length;
                    img.src = designer.portfolio[carouselIndexes[designer.id]];
                }
            });
        });
    }

    // Função de busca
    function handleSearch(searchValue) {
        // Se a busca estiver vazia, mostra todos os designers
        if (!searchValue.trim()) {
            filteredDesigners = designers;
            renderDesigners();
            return;
        }

        // Divide a busca por vírgulas e remove espaços em branco
        const searchTerms = searchValue.split(',').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
        
        filteredDesigners = designers.filter(designer => {
            const designerName = designer.name.toLowerCase();
            const designerSpecialties = designer.specialties.map(s => s.toLowerCase());
            
            // Verifica se pelo menos um termo de busca corresponde ao nome
            const nameMatch = searchTerms.some(term => designerName.includes(term));
            
            // Verifica se todos os termos de busca estão presentes nas especialidades
            const specialtiesMatch = searchTerms.every(term => 
                designerSpecialties.some(specialty => specialty.includes(term))
            );
            
            return nameMatch || specialtiesMatch;
        });
        
        renderDesigners();
        // Sincroniza os campos de busca desktop e mobile
        if (searchInputDesktop.value !== searchValue) {
            searchInputDesktop.value = searchValue;
        }
        if (searchInputMobile.value !== searchValue) {
            searchInputMobile.value = searchValue;
        }
    }

    // Eventos de busca
    searchInputDesktop.addEventListener('input', (e) => handleSearch(e.target.value));
    searchInputMobile.addEventListener('input', (e) => handleSearch(e.target.value));

    // Inicializa
    fetchDesigners();

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
            return designers;
        },
        async searchPartners(query) {
            // Se a busca estiver vazia, retorna todos os designers
            if (!query.trim()) {
                return designers;
            }

            // Divide a busca por vírgulas e remove espaços em branco
            const searchTerms = query.split(',').map(term => term.trim().toLowerCase()).filter(term => term.length > 0);
            
            return designers.filter(designer => {
                const designerName = designer.name.toLowerCase();
                const designerSpecialties = designer.specialties.map(s => s.toLowerCase());
                
                // Verifica se pelo menos um termo de busca corresponde ao nome
                const nameMatch = searchTerms.some(term => designerName.includes(term));
                
                // Verifica se todos os termos de busca estão presentes nas especialidades
                const specialtiesMatch = searchTerms.every(term => 
                    designerSpecialties.some(specialty => specialty.includes(term))
                );
                
                return nameMatch || specialtiesMatch;
            });
        },
        async getPartner(id) {
            return designers.find(designer => designer.id === id);
        }
    };

    // Funções disponíveis para integração
    // toggleLoginState(), setLoginState(state), partnersAPI
});
