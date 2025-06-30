// DOM Elements
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

// Form switching functionality
function showSignupForm() {
    signinForm.style.display = 'none';
    signupForm.style.display = 'block';
}

function showSigninForm() {
    signupForm.style.display = 'none';
    signinForm.style.display = 'block';
}

// Password toggle functionality with animation
function togglePassword(passwordInput, toggleButton) {
    const visibleEye = toggleButton.querySelector('.visible-eye');
    const closedEye = toggleButton.querySelector('.closed-eye');
    
    // Add animation class
    toggleButton.classList.add('animating');
    
    setTimeout(() => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            visibleEye.style.display = 'none';
            closedEye.style.display = 'block';
        } else {
            passwordInput.type = 'password';
            visibleEye.style.display = 'block';
            closedEye.style.display = 'none';
        }
        
        // Remove animation class
        toggleButton.classList.remove('animating');
    }, 150);
}

// CPF/CNPJ formatting
function formatCpfCnpj(value) {
    // Remove all non-numeric characters
    value = value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        // CPF format: 000.000.000-00
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ format: 00.000.000/0000-00
        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
        value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    return value;
}

// Form validation
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

// Remember me functionality
function setRememberMe(remember) {
    if (remember) {
        localStorage.setItem('brandge_remember_user', 'true');
    } else {
        localStorage.removeItem('brandge_remember_user');
    }
}

function checkRememberMe() {
    const remembered = localStorage.getItem('brandge_remember_user');
    if (remembered) {
        rememberMeCheckbox.checked = true;
    }
}

// Sign in functionality
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
            // Set remember me preference
            setRememberMe(formData.remember);
            
            // Redirect to dashboard or home page
            window.location.href = result.redirect || 'dashboard.html';
        } else {
            alert(result.message || 'Erro ao fazer login. Verifique suas credenciais.');
        }
    } catch (error) {
        console.error('Signin error:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Sign up functionality
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
            
            // Pre-fill email in signin form
            document.getElementById('signin-email').value = formData.email;
        } else {
            alert(result.message || 'Erro ao criar conta. Tente novamente.');
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Erro de conexão. Tente novamente.');
    }
}

// Delete user functionality (for admin purposes)
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

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check remember me on page load
    checkRememberMe();
    
    // Form switching
    showSignupBtn.addEventListener('click', showSignupForm);
    showSigninBtn.addEventListener('click', showSigninForm);
    
    // Password toggles
    signinPasswordToggle.addEventListener('click', () => {
        togglePassword(signinPassword, signinPasswordToggle);
    });
    
    signupPasswordToggle.addEventListener('click', () => {
        togglePassword(signupPassword, signupPasswordToggle);
    });
    
    // CPF/CNPJ formatting
    const cpfInput = document.getElementById('signup-cpf');
    cpfInput.addEventListener('input', function(e) {
        e.target.value = formatCpfCnpj(e.target.value);
    });
    
    // Sign in form submission
    signinBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signin-email').value;
        const password = document.getElementById('signin-password').value;
        const remember = document.getElementById('remember-me').checked;
        
        // Validation
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
        
        // Handle signin
        handleSignin({
            email: email,
            password: password,
            remember: remember
        });
    });
    
    // Sign up form submission
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const cpfCnpj = document.getElementById('signup-cpf').value;
        const password = document.getElementById('signup-password').value;
        
        // Validation
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
        
        // Handle signup
        handleSignup({
            name: name,
            email: email,
            cpf_cnpj: cpfCnpj.replace(/\D/g, ''), // Send only numbers to backend
            password: password
        });
    });
    
    // Remember me checkbox
    rememberMeCheckbox.addEventListener('change', function() {
        setRememberMe(this.checked);
    });
});

// Utility functions for backend integration
window.BrandgeAuth = {
    signin: handleSignin,
    signup: handleSignup,
    deleteUser: deleteUser,
    validateEmail: validateEmail,
    validateCpfCnpj: validateCpfCnpj,
    validatePassword: validatePassword,
    formatCpfCnpj: formatCpfCnpj
};

