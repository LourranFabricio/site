// Seleção dos elementos do DOM
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const showSignupBtn = document.getElementById('show-signup');
const showSigninBtn = document.getElementById('show-signin');
const signinPasswordToggle = document.getElementById('signin-password-toggle');
const signupPasswordToggle = document.getElementById('signup-password-toggle');
const signinPassword = document.getElementById('signin-password');
const signupPassword = document.getElementById('signup-password');
const signinBtn = document.getElementById('signin-btn');
const signupBtn = document.getElementById('signup-btn');
const rememberMeCheckbox = document.getElementById('remember-me');

// Função para log no console (para debug)
function log(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`, data || '');
}

// Troca de formulários (login/cadastro)
function showSignupForm() {
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
    log('Switched to signup form');
}

function showSigninForm() {
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
    log('Switched to signin form');
}

// Alternar visibilidade da senha com animação
function togglePassword(passwordInput, toggleButton) {
    const visibleEye = toggleButton.querySelector('.visible-eye');
    const closedEye = toggleButton.querySelector('.closed-eye');

    // Adiciona classe de animação (pode ser usada para transições CSS)
    toggleButton.classList.add('animating');

    setTimeout(() => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            visibleEye.style.display = 'block';
            closedEye.style.display = 'none';
        } else {
            passwordInput.type = 'password';
            visibleEye.style.display = 'none';
            closedEye.style.display = 'block';
        }

        // Remove a classe de animação após o efeito
        toggleButton.classList.remove('animating');
    }, 150);
}

// Formatação de CPF ou CNPJ conforme digita
function formatCpfCnpj(value) {
    value = value.replace(/\D/g, ''); // Remove tudo que não for número

    if (value.length <= 11) {
        // Formata como CPF: 000.000.000-00
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // Formata como CNPJ: 00.000.000/0000-00
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }

    return value;
}

// Função para formatar telefone (igual ao profile)
function formatPhone(phone) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
        return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    } else if (digits.length === 13) {
        return `+${digits.slice(0,2)} (${digits.slice(2,4)}) ${digits.slice(4,9)}-${digits.slice(9)}`;
    }
    return phone;
}

// Validações dos campos
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateCpfCnpj(value) {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.length === 11 || cleanValue.length === 14;
}

function validatePassword(password) {
    return password.length >= 6;
}

// Salvar ou limpar preferência de "Lembrar-me"
function setRememberMe(remember) {
    if (remember) {
        localStorage.setItem('brandge_remember_user', 'true');
    } else {
        localStorage.removeItem('brandge_remember_user');
    }
}

// Verifica se o usuário marcou "Lembrar-me" ao carregar a página
function checkRememberMe() {
    const remembered = localStorage.getItem('brandge_remember_user');
    if (remembered) {
        rememberMeCheckbox.checked = true;
    }
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

// Lógica de login (envio via fetch para signin.php)
function handleSignin(formData) {
    log('handleSignin chamado com:', formData);

    // Mostra loading no botão
    const originalText = signinBtn.textContent;
    signinBtn.textContent = 'Entrando...';
    signinBtn.disabled = true;

    fetch('api/login.php', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
    })
    .then(async response => {
        log('Response status:', response.status);
        log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await safeJsonResponse(response);
        log('Parsed JSON:', result);
        
        if (response.ok && result.success) {
            setRememberMe(formData.remember);
            log('Login successful, redirecting...');
            window.location.href = result.redirect || 'profile.html';
        } else {
            log('Login failed:', result.error);
            alert(result.error || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    })
    .catch(error => {
        log('Fetch error:', error);
        alert('Erro de conexão. Tente novamente.');
    })
    .finally(() => {
        // Restaura o botão
        signinBtn.textContent = originalText;
        signinBtn.disabled = false;
    });
}

// Lógica de cadastro (envio via fetch para api/register.php)
async function handleSignup(formData) {
    log('handleSignup chamado com:', formData);
    
    // Mostra loading no botão
    const originalText = signupBtn.textContent;
    signupBtn.textContent = 'Cadastrando...';
    signupBtn.disabled = true;
    
    try {
        const response = await fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                cpf_cnpj: formData.cpf_cnpj,
                password: formData.password,
                role: formData.role,
                phone: formData.phone
            })
        });

        log('Registration response status:', response.status);
        
        const result = await safeJsonResponse(response);
        log('Registration result:', result);

        if (result.success) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            showSigninForm();

            // Preenche o campo de email do login com o email cadastrado
            document.getElementById('signin-email').value = formData.email;
        } else {
            // Tratamento específico para diferentes tipos de erro
            let errorMessage = result.error || 'Erro ao criar conta. Tente novamente.';
            
            // Mensagens específicas para erros conhecidos
            if (result.error === 'E-mail já cadastrado') {
                errorMessage = 'Este e-mail já está cadastrado. Use outro e-mail ou faça login.';
            } else if (result.error === 'CPF ou CNPJ já cadastrado') {
                errorMessage = 'Este CPF ou CNPJ já está cadastrado. Verifique os dados ou entre em contato conosco.';
            } else if (result.error === 'CPF ou CNPJ inválido') {
                errorMessage = 'CPF ou CNPJ inválido. Verifique se os dados estão corretos.';
            } else if (result.error === 'Formato de e-mail inválido') {
                errorMessage = 'Formato de e-mail inválido. Verifique se o e-mail está correto.';
            } else if (result.error === 'A senha deve ter pelo menos 6 caracteres') {
                errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
            } else if (result.error === 'Todos os campos são obrigatórios') {
                errorMessage = 'Todos os campos são obrigatórios. Preencha todos os dados.';
            }
            
            alert(errorMessage);
        }
    } catch (error) {
        log('Registration error:', error);
        alert('Erro de conexão. Tente novamente.');
    } finally {
        // Restaura o botão
        signupBtn.textContent = originalText;
        signupBtn.disabled = false;
    }
}

// Função para deletar usuário (usada por administradores)
async function deleteUser(userId) {
    try {
        const response = await fetch('delete_user.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: userId
            })
        });

        const result = await safeJsonResponse(response);

        if (result.success) {
            alert('Usuário deletado com sucesso.');
        } else {
            alert(result.message || 'Erro ao deletar usuário.');
        }
    } catch (error) {
        log('Delete user error:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Eventos após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    log('Login page loaded');
    
    // Verifica se deve marcar "lembrar-me"
    checkRememberMe();

    // Alterna entre formulários de login/cadastro
    showSignupBtn.addEventListener('click', showSignupForm);
    showSigninBtn.addEventListener('click', showSigninForm);

    // Alterna visibilidade da senha nos formulários
    signinPasswordToggle.addEventListener('click', () => {
        togglePassword(signinPassword, signinPasswordToggle);
    });

    signupPasswordToggle.addEventListener('click', () => {
        togglePassword(signupPassword, signupPasswordToggle);
    });

    // Formata CPF/CNPJ em tempo real
    const cpfInput = document.getElementById('signup-cpf');
    cpfInput.addEventListener('input', function(e) {
        e.target.value = formatCpfCnpj(e.target.value);
    });

    // Formatação e restrição do telefone em tempo real
    const phoneInput = document.getElementById('signup-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let val = phoneInput.value.replace(/\D/g, '');
            if (val.length > 13) val = val.slice(0,13);
            phoneInput.value = formatPhone(val);
        });
    }

    // Envio do formulário de login
    signinBtn.addEventListener('click', function(e) {
        e.preventDefault();
        log('Botão de login clicado');
        
        const email = document.getElementById('signin-email').value.trim();
        const password = document.getElementById('signin-password').value;
        const remember = document.getElementById('remember-me').checked;

        // Validações
        if (!email || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido.');
            return;
        }

        if (!validatePassword(password)) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Realiza login
        handleSignin({
            email: email,
            password: password,
            remember: remember
        });
    });

    // Envio do formulário de cadastro
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        log('Botão de cadastro clicado');

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const cpf_cnpj = document.getElementById('signup-cpf').value.trim();
        const password = document.getElementById('signup-password').value;
        const role = document.querySelector('input[name="role"]:checked').value;
        const phone = document.getElementById('signup-phone').value.trim();

        // Validações
        if (!name || !email || !cpf_cnpj || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido.');
            return;
        }
        if (!validateCpfCnpj(cpf_cnpj)) {
            alert('CPF ou CNPJ inválido.');
            return;
        }
        if (!validatePassword(password)) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        // Realiza cadastro
        handleSignup({
            name: name,
            email: email,
            cpf_cnpj: cpf_cnpj,
            password: password,
            role: role,
            phone: phone
        });
    });

    // Atualiza armazenamento local ao marcar/desmarcar "lembrar-me"
    rememberMeCheckbox.addEventListener('change', function() {
        setRememberMe(this.checked);
    });
    
    log('Login page event listeners attached');
});

// Torna funções disponíveis globalmente 
window.BrandgeAuth = {
    signin: handleSignin,
    signup: handleSignup,
    deleteUser: deleteUser,
    validateEmail: validateEmail,
    validateCpfCnpj: validateCpfCnpj,
    validatePassword: validatePassword,
    formatCpfCnpj: formatCpfCnpj,
    formatPhone: formatPhone
};
