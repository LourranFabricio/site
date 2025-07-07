// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {

    // Elementos do DOM (botões e inputs)
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');
    const deleteButton = document.getElementById('delete-button');
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');
    const modalCancel = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    const profilePicture = document.getElementById('profile-picture');
    const profilePictureInput = document.getElementById('profile-picture-input');

    // Campos do formulário
    const nameValue = document.getElementById('name-value');
    const nameInput = document.getElementById('name-input');
    const emailValue = document.getElementById('email-value');
    const emailInput = document.getElementById('email-input');
    const passwordValue = document.getElementById('password-value');
    const passwordInput = document.getElementById('password-input');
    const currentPasswordRow = document.getElementById('current-password-row');
    const currentPasswordInput = document.getElementById('current-password-input');
    const phoneValue = document.getElementById('phone-value');
    const phoneInput = document.getElementById('phone-input');
    const profileDescription = document.getElementById('profile-description');
    const profileDescriptionEdit = document.getElementById('profile-description-edit');
    const newPasswordRow = document.getElementById('new-password-row');
    const specialtiesRow = document.getElementById('specialties-row');
    const specialtiesList = document.getElementById('specialties-list');

    // Variáveis de estado
    let isEditing = false;
    let originalData = {}; // Dados originais do usuário
    let allSpecialties = [];
    let selectedSpecialties = [];

    // Armazena os dados atuais do perfil para restauração se necessário
    function storeOriginalData() {
        originalData = {
            name: nameValue.textContent,
            email: emailValue.textContent,
            phone: phoneValue.textContent,
            description: profileDescription.textContent,
            profilePicture: profilePicture.src
        };
    }

    // Inicializa os dados originais ao carregar
    storeOriginalData();

    // Alterna o modo de edição
    function toggleEditMode() {
        isEditing = !isEditing;

        if (isEditing) {
            enterEditMode();  // Entra no modo de edição
        } else {
            exitEditMode();   // Sai do modo de edição
        }
    }

    // Modo de edição ativado
    function enterEditMode() {
        editButton.style.display = 'none';
        saveButton.style.display = 'inline-block';
        cancelButton.style.display = 'inline-block';

        nameValue.style.display = 'none';
        nameInput.style.display = 'block';
        emailValue.style.display = 'none';
        emailInput.style.display = 'block';
        currentPasswordRow.style.display = 'flex';
        currentPasswordInput.style.display = 'block';
        newPasswordRow.style.display = 'flex';
        passwordInput.style.display = 'block';
        phoneValue.style.display = 'none';
        phoneInput.style.display = 'block';
        profileDescription.style.display = 'none';
        profileDescriptionEdit.style.display = 'block';
        if (userRole === 'designer') {
            specialtiesRow.style.display = 'flex';
            renderSpecialtiesCheckboxes();
            specialtiesList.querySelectorAll('input[type=checkbox]').forEach(cb => cb.disabled = false);
        } else {
            specialtiesRow.style.display = 'none';
        }

        // Torna a imagem clicável para alterar
        profilePicture.style.cursor = 'pointer';
        profilePicture.title = 'Clique para alterar foto';
    }

    // Sai do modo de edição e restaura o visual original
    function exitEditMode() {
        isEditing = false;

        editButton.style.display = 'inline-block';
        saveButton.style.display = 'none';
        cancelButton.style.display = 'none';

        nameValue.style.display = 'block';
        nameInput.style.display = 'none';
        emailValue.style.display = 'block';
        emailInput.style.display = 'none';
        currentPasswordRow.style.display = 'none';
        currentPasswordInput.style.display = 'none';
        newPasswordRow.style.display = 'none';
        passwordInput.style.display = 'none';
        phoneValue.style.display = 'block';
        phoneInput.style.display = 'none';
        profileDescription.style.display = 'block';
        profileDescriptionEdit.style.display = 'none';
        if (userRole === 'designer') {
            specialtiesRow.style.display = 'flex';
            renderSpecialtiesCheckboxes();
            specialtiesList.querySelectorAll('input[type=checkbox]').forEach(cb => cb.disabled = true);
        } else {
            specialtiesRow.style.display = 'none';
        }

        // Restaura aparência da imagem
        profilePicture.style.cursor = 'default';
        profilePicture.title = '';

        // Limpa campos de senha
        passwordInput.value = '';
        currentPasswordInput.value = '';
    }

    // Função para formatar telefone
    function formatPhone(phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 11) {
            return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
        } else if (digits.length === 13) {
            return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,9)}-${digits.slice(9)}`;
        }
        return phone;
    }

    // Formatação automática ao digitar
    phoneInput.addEventListener('input', function() {
        let val = phoneInput.value.replace(/\D/g, '');
        if (val.length > 13) val = val.slice(0,13);
        phoneInput.value = formatPhone(val);
    });

    // Validação de telefone
    function isValidPhone(phone) {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 || digits.length === 13;
    }

    // Salva alterações no perfil
    async function saveChanges() {
        if (!nameInput.value.trim()) {
            alert('Nome é obrigatório');
            return;
        }

        if (!emailInput.value.trim()) {
            alert('Email é obrigatório');
            return;
        }

        // Valida formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            alert('Email inválido');
            return;
        }

        // Se for trocar senha, exige senha atual
        if (passwordInput.value && !currentPasswordInput.value) {
            alert('Digite sua senha atual para alterar a senha');
            return;
        }

        if (!isValidPhone(phoneInput.value)) {
            alert('Telefone inválido. Use 11 ou 13 dígitos.');
            return;
        }

        try {
            const updateData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                description: profileDescriptionEdit.value.trim()
            };

            if (passwordInput.value) {
                if (!currentPasswordInput.value) {
                    alert('Digite sua senha atual para alterar a senha');
                    return;
                }
                updateData.currentPassword = currentPasswordInput.value;
                updateData.newPassword = passwordInput.value;
            }

            if (userRole === 'designer') {
                updateData.specialties = selectedSpecialties;
            }

            const response = await fetch('api/update-profile.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
                credentials: 'same-origin'
            });
            const result = await safeJsonResponse(response);

            if (result.success) {
                // Atualiza interface
                nameValue.textContent = updateData.name;
                emailValue.textContent = updateData.email;
                phoneValue.textContent = updateData.phone;
                profileDescription.textContent = updateData.description;

                storeOriginalData(); // Atualiza dados originais

                exitEditMode(); // Sai do modo edição
                alert('Perfil atualizado com sucesso!');
                // Limpa campos de senha
                passwordInput.value = '';
                currentPasswordInput.value = '';
            } else {
                alert(result.message || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            // Log será feito no servidor
            alert('Erro ao atualizar perfil. Tente novamente.');
        }
    }

    // Cancela alterações e restaura os valores originais
    function cancelChanges() {
        nameInput.value = originalData.name;
        emailInput.value = originalData.email;
        phoneInput.value = originalData.phone;
        profileDescriptionEdit.value = originalData.description;
        profilePicture.src = originalData.profilePicture;

        exitEditMode();
    }

    // Lida com alteração da imagem de perfil
    function handleProfilePictureChange(event) {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor, selecione uma imagem válida');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('A imagem deve ter no máximo 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                profilePicture.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }

    // Exibe modal de confirmação para exclusão da conta
    function showDeleteModal() {
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Esconde o modal de confirmação
    function hideDeleteModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('delete-password').value = '';
    }

    // Confirma a exclusão da conta
    async function confirmDelete() {
        const password = document.getElementById('delete-password').value;

        if (!password) {
            alert('Digite sua senha para confirmar a exclusão');
            return;
        }

        try {
            const response = await deleteAccount(password);
            if (response.success) {
                alert('Conta excluída com sucesso');
                window.location.href = '/'; // Redireciona
            } else {
                alert(response.message || 'Erro ao excluir conta');
            }
        } catch (error) {
            // Log será feito no servidor
            alert('Erro ao excluir conta. Tente novamente.');
        }
    }

    // EVENTOS

    editButton.addEventListener('click', toggleEditMode);
    saveButton.addEventListener('click', saveChanges);
    cancelButton.addEventListener('click', cancelChanges);
    deleteButton.addEventListener('click', showDeleteModal);
    modalClose.addEventListener('click', hideDeleteModal);
    modalCancel.addEventListener('click', hideDeleteModal);
    modalConfirm.addEventListener('click', confirmDelete);
    profilePictureInput.addEventListener('change', handleProfilePictureChange);

    // Permite clicar na imagem para trocar quando em modo de edição
    profilePicture.addEventListener('click', () => {
        if (isEditing) {
            profilePictureInput.click();
        }
    });

    // Fecha o modal ao clicar fora do conteúdo
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            hideDeleteModal();
        }
    });

    // ===== BACKEND SIMULADO ===== //

    async function updateProfile(data) {
        try {
            // Simulação de chamada ao backend
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true });
                }, 1000);
            });
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            return { success: false, message: 'Erro de rede' };
        }
    }

    async function deleteAccount(password) {
        try {
            const response = await fetch('api/delete-account.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: password }),
                credentials: 'same-origin'
            });
            const result = await safeJsonResponse(response);
            return result;
        } catch (error) {
            console.error('Erro ao excluir conta:', error);
            return { success: false, message: 'Erro de rede' };
        }
    }

    async function uploadProfilePicture(file) {
        try {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        url: URL.createObjectURL(file)
                    });
                }, 1000);
            });
        } catch (error) {
            // Log será feito no servidor
            return { success: false };
        }
    }

    function getAuthToken() {
        return localStorage.getItem('brandge_auth_token') || '';
    }

    // Função para buscar dados do usuário logado (universal)
    async function fetchProfileData() {
        const res = await fetch('api/check-session.php', { credentials: 'same-origin' });
        const session = await safeJsonResponse(res);
        if (!session.success) {
            window.location.href = 'login.html';
            return;
        }
        userRole = session.user.role;
        // Preencher campos
        nameValue.textContent = session.user.name;
        nameInput.value = session.user.name;
        emailValue.textContent = session.user.email;
        emailInput.value = session.user.email;
        phoneValue.textContent = session.user.phone || '';
        phoneInput.value = session.user.phone || '';
        profileDescription.textContent = session.user.bio || '';
        profileDescriptionEdit.value = session.user.bio || '';
        // Imagem de perfil (se houver)
        if (session.user.profile_picture) {
            profilePicture.src = session.user.profile_picture;
        }
        // Se for designer, mostrar portfólio e especialidades
        if (userRole === 'designer') {
            portfolioSection.style.display = 'block';
            specialtiesRow.style.display = 'flex';
            loadPortfolio();
            await fetchAllSpecialties();
            await fetchDesignerSpecialties();
            specialtiesRow.style.display = 'flex';
            renderSpecialtiesCheckboxes();
            specialtiesList.querySelectorAll('input[type=checkbox]').forEach(cb => cb.disabled = true);
        } else {
            portfolioSection.style.display = 'none';
            specialtiesRow.style.display = 'none';
        }
    }

    // Função para carregar portfólio do designer
    async function loadPortfolio() {
        portfolioList.innerHTML = '<li>Carregando...</li>';
        const res = await fetch('api/get-portfolio.php', { credentials: 'same-origin' });
        const data = await safeJsonResponse(res);
        if (!data.success) {
            portfolioList.innerHTML = '<li>Erro ao carregar portfólio</li>';
            return;
        }
        if (!data.images.length) {
            portfolioList.innerHTML = '<li>Nenhuma imagem enviada</li>';
            return;
        }
        portfolioList.innerHTML = '';
        data.images.forEach(img => {
            const li = document.createElement('li');
            li.className = 'portfolio-item';
            
            // Criar container da miniatura
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.className = 'portfolio-thumbnail';
            
            // Criar miniatura da imagem
            const thumbnail = document.createElement('img');
            thumbnail.src = img.filename;
            thumbnail.alt = 'Miniatura do portfólio';
            thumbnail.className = 'portfolio-thumbnail-img';
            
            // Criar nome do arquivo
            const fileName = document.createElement('span');
            fileName.className = 'portfolio-filename';
            if (img.filename) {
                fileName.textContent = img.filename.split('/').pop();
            } else {
                fileName.textContent = '';
            }
            
            // Criar botão de exclusão
            const delBtn = document.createElement('button');
            delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>';
            delBtn.title = 'Excluir imagem';
            delBtn.className = 'portfolio-delete-btn';
            delBtn.onclick = () => deletePortfolioImage(img.id);
            
            // Montar estrutura
            thumbnailContainer.appendChild(thumbnail);
            li.appendChild(thumbnailContainer);
            li.appendChild(fileName);
            li.appendChild(delBtn);
            portfolioList.appendChild(li);
        });
    }

    // Função para excluir imagem do portfólio
    async function deletePortfolioImage(imageId) {
        if (!confirm('Deseja realmente excluir esta imagem?')) return;
        const res = await fetch('api/delete-portfolio-image.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: imageId }),
            credentials: 'same-origin'
        });
        const data = await safeJsonResponse(res);
        if (data.success) {
            loadPortfolio();
        } else {
            alert(data.message || 'Erro ao excluir imagem');
        }
    }

    // Elementos do portfólio
    const portfolioSection = document.getElementById('portfolio-section');
    const portfolioList = document.getElementById('portfolio-list');
    const portfolioUploadForm = document.getElementById('portfolio-upload-form');
    const portfolioFilesInput = document.getElementById('portfolio-files');
    const portfolioUploadBtn = document.getElementById('portfolio-upload-btn');
    const portfolioUploadInfo = document.getElementById('portfolio-upload-info');

    // Adicionar listeners do portfólio só se os elementos existirem
    if (portfolioUploadBtn && portfolioFilesInput && portfolioUploadForm && portfolioUploadInfo) {
        portfolioUploadBtn.addEventListener('click', () => portfolioFilesInput.click());
        portfolioFilesInput.addEventListener('change', () => {
            if (portfolioFilesInput.files.length) {
                portfolioUploadInfo.textContent = Array.from(portfolioFilesInput.files).map(f => f.name).join(', ');
            } else {
                portfolioUploadInfo.textContent = 'Nenhuma imagem selecionada';
            }
        });
        portfolioUploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!portfolioFilesInput.files.length) {
                alert('Selecione pelo menos uma imagem');
                return;
            }
            const formData = new FormData();
            for (const file of portfolioFilesInput.files) {
                formData.append('portfolio_files[]', file);
            }
            const res = await fetch('api/upload-portfolio.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            const data = await safeJsonResponse(res);
            if (data.success) {
                portfolioFilesInput.value = '';
                portfolioUploadInfo.textContent = 'Nenhuma imagem selecionada';
                loadPortfolio();
            } else {
                alert(data.message || 'Erro ao enviar imagens');
            }
        });
    }

    // Função para buscar todas as especialidades
    async function fetchAllSpecialties() {
        const res = await fetch('api/list-specialties.php', { credentials: 'same-origin' });
        const data = await safeJsonResponse(res);
        if (data.success) {
            allSpecialties = data.specialties;
        }
    }

    // Função para buscar especialidades do designer
    async function fetchDesignerSpecialties() {
        const res = await fetch('api/get-specialties.php', { credentials: 'same-origin' });
        const data = await safeJsonResponse(res);
        if (data.success) {
            selectedSpecialties = data.specialties.map(s => String(s.id));
        }
    }

    // Renderiza os checkboxes de especialidades
    function renderSpecialtiesCheckboxes() {
        specialtiesList.innerHTML = '';
        allSpecialties.forEach(spec => {
            const label = document.createElement('label');
            label.style.marginRight = '12px';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = spec.id;
            checkbox.checked = selectedSpecialties.includes(String(spec.id));
            checkbox.onchange = function() {
                if (checkbox.checked) {
                    if (!selectedSpecialties.includes(checkbox.value)) selectedSpecialties.push(checkbox.value);
                } else {
                    selectedSpecialties = selectedSpecialties.filter(id => id !== checkbox.value);
                }
            };
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(' ' + spec.name));
            specialtiesList.appendChild(label);
        });
    }

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

    // Substituir chamada de inicialização para usar fetchProfileData
    fetchProfileData();
});
