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

    // Variáveis de estado
    let isEditing = false;
    let originalData = {}; // Dados originais do usuário

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
        passwordValue.style.display = 'block';
        passwordInput.style.display = 'block';
        currentPasswordRow.style.display = 'flex';
        currentPasswordInput.style.display = 'block';
        phoneValue.style.display = 'none';
        phoneInput.style.display = 'block';
        profileDescription.style.display = 'none';
        profileDescriptionEdit.style.display = 'block';

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
        passwordValue.style.display = 'none';
        passwordInput.style.display = 'none';
        currentPasswordRow.style.display = 'none';
        currentPasswordInput.style.display = 'none';
        phoneValue.style.display = 'block';
        phoneInput.style.display = 'none';
        profileDescription.style.display = 'block';
        profileDescriptionEdit.style.display = 'none';

        // Restaura aparência da imagem
        profilePicture.style.cursor = 'default';
        profilePicture.title = '';

        // Limpa campos de senha
        passwordInput.value = '';
        currentPasswordInput.value = '';
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

        try {
            const updateData = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                description: profileDescriptionEdit.value.trim()
            };

            if (passwordInput.value) {
                updateData.newPassword = passwordInput.value;
                updateData.currentPassword = currentPasswordInput.value;
            }

            const response = await updateProfile(updateData);

            if (response.success) {
                // Atualiza interface
                nameValue.textContent = updateData.name;
                emailValue.textContent = updateData.email;
                phoneValue.textContent = updateData.phone;
                profileDescription.textContent = updateData.description;

                storeOriginalData(); // Atualiza dados originais

                exitEditMode(); // Sai do modo edição
                alert('Perfil atualizado com sucesso!');
            } else {
                alert(response.message || 'Erro ao atualizar perfil');
            }
        } catch (error) {
            console.error('Erro ao salvar:', error);
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
            console.error('Erro ao excluir:', error);
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
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({ success: true });
                }, 1000);
            });
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
            console.error('Erro ao fazer upload da imagem:', error);
            return { success: false };
        }
    }

    function getAuthToken() {
        return localStorage.getItem('brandge_auth_token') || '';
    }

    async function loadProfileData() {
        try {
            // Exemplo: busca os dados do usuário logado no backend
            const res = await fetch('/backend/get_user.php', {
                headers: { Authorization: `Bearer ${getAuthToken()}` }
            });
            if (!res.ok) throw new Error('Erro ao buscar dados');
            const user = await res.json();

            // Preenche os campos do perfil
            nameValue.textContent = user.nome || "";
            nameInput.value = user.nome || "";
            emailValue.textContent = user.email || "";
            emailInput.value = user.email || "";
            phoneValue.textContent = user.telefone || "";
            phoneInput.value = user.telefone || "";
            profileDescription.textContent = user.descricao || "";
            profileDescriptionEdit.value = user.descricao || "";
            document.getElementById("document-value").textContent = user.documento || "";

            // Se tiver foto de perfil
            if (user.foto) profilePicture.src = user.foto;

        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
            // window.location.href = 'login.html'; // se quiser redirecionar se não estiver logado
        }
    }

    // Inicializa os dados do perfil na página
    loadProfileData();

    console.log('Página de perfil carregada com sucesso!');
});
