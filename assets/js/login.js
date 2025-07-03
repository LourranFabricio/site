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

// Troca de formulários (login/cadastro)
function showSignupForm() {
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
}

function showSigninForm() {
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
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

// Lógica de login (envio via fetch para signin.php)
async function handleSignin(formData) {
    try {
        const response = await fetch('signin.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.email,
                password: formData.password,
                remember: formData.remember
            })
        });

        const result = await response.json();

        if (result.success) {
            // Salva preferência de "lembrar-me"
            setRememberMe(formData.remember);

            // Redireciona para dashboard ou página definida
            window.location.href = result.redirect || 'dashboard.html';
        } else {
            alert(result.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Signin error:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Lógica de cadastro (envio via fetch para signup.php)
async function handleSignup(formData) {
    try {
        const response = await fetch('signup.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                cpf_cnpj: formData.cpf_cnpj,
                password: formData.password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('Conta criada com sucesso! Faça login para continuar.');
            showSigninForm();

            // Preenche o campo de email do login com o email cadastrado
            document.getElementById('signin-email').value = formData.email;
        } else {
            alert(result.message || 'Erro ao criar conta. Tente novamente.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Erro de conexão. Tente novamente.');
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

        const result = await response.json();

        if (result.success) {
            alert('Usuário deletado com sucesso.');
        } else {
            alert(result.message || 'Erro ao deletar usuário.');
        }
    } catch (error) {
        console.error('Delete user error:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Eventos após o carregamento da página
document.addEventListener('DOMContentLoaded', function() {
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

    // Envio do formulário de login
    signinBtn.addEventListener('click', function(e) {
        e.preventDefault();

        const email = document.getElementById('signin-email').value;
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

        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const cpfCnpj = document.getElementById('signup-cpf').value;
        const password = document.getElementById('signup-password').value;

        // Validações
        if (!name || !email || !cpfCnpj || !password) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        if (!validateEmail(email)) {
            alert('Por favor, insira um email válido.');
            return;
        }

        if (!validateCpfCnpj(cpfCnpj)) {
            alert('Por favor, insira um CPF ou CNPJ válido.');
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
            cpf_cnpj: cpfCnpj.replace(/\D/g, ''), // Envia apenas números
            password: password
        });
    });

    // Atualiza armazenamento local ao marcar/desmarcar "lembrar-me"
    rememberMeCheckbox.addEventListener('change', function() {
        setRememberMe(this.checked);
    });
});

// Torna funções disponíveis globalmente 
window.BrandgeAuth = {
    signin: handleSignin,
    signup: handleSignup,
    deleteUser: deleteUser,
    validateEmail: validateEmail,
    validateCpfCnpj: validateCpfCnpj,
    validatePassword: validatePassword,
    formatCpfCnpj: formatCpfCnpj
};
