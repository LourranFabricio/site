<?php
// Inicia buffer de saída
ob_start();

// Inclui o sistema de logs
require_once __DIR__ . '/../src/config/logger.php';
Logger::init();

// Desativa exibição de erros para não misturar HTML na resposta JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Define que todas as respostas serão JSON
header('Content-Type: application/json; charset=utf-8');

// Log do início da requisição
Logger::access('Registration attempt started', null, [
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown'
]);

// Inclui as variáveis de conexão ao banco
try {
    require_once __DIR__ . '/../src/config/db.php';
    Logger::info('Database connection included successfully');
} catch (Exception $e) {
    Logger::error('Failed to include database config', ['error' => $e->getMessage()]);
    http_response_code(500);
    ob_clean();
    echo json_encode(['error' => 'Erro de configuração do servidor']);
    exit;
}

// Prepara o payload da resposta
$payload = [];

try {
    // 1) Apenas aceita POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        Logger::warning('Invalid HTTP method for registration', ['method' => $_SERVER['REQUEST_METHOD']]);
        http_response_code(405);
        $payload = ['error' => 'Método não permitido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // 2) Lê e decodifica JSON
    $raw  = file_get_contents('php://input');
    Logger::debug('Raw request body received', ['length' => strlen($raw)]);
    
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        Logger::error('Invalid JSON in registration request', [
            'json_error' => json_last_error_msg(),
            'raw_data' => substr($raw, 0, 100) // Primeiros 100 caracteres para debug
        ]);
        http_response_code(400);
        $payload = ['error' => 'JSON inválido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    Logger::debug('JSON decoded successfully', ['fields' => array_keys($data)]);

    // 3) Extrai e valida campos
    $name     = trim($data['name']     ?? '');
    $email    = trim($data['email']    ?? '');
    $password = $data['password'] ?? '';
    $cpf_cnpj = trim($data['cpf_cnpj'] ?? '');
    $phone    = trim($data['phone']    ?? '');
    $role     = $data['role']     ?? 'cliente';

    Logger::info('Registration attempt', [
        'email' => $email,
        'role' => $role,
        'name_length' => strlen($name),
        'cpf_cnpj_length' => strlen($cpf_cnpj)
    ]);

    if (!$name || !$email || !$password || !$cpf_cnpj) {
        Logger::warning('Missing required fields in registration', [
            'name_provided' => !empty($name),
            'email_provided' => !empty($email),
            'password_provided' => !empty($password),
            'cpf_cnpj_provided' => !empty($cpf_cnpj)
        ]);
        http_response_code(400);
        $payload = ['error' => 'Todos os campos são obrigatórios'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // Validações adicionais
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Logger::warning('Invalid email format in registration', ['email' => $email]);
        http_response_code(400);
        $payload = ['error' => 'Formato de e-mail inválido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    if (strlen($password) < 6) {
        Logger::warning('Password too short in registration', ['password_length' => strlen($password)]);
        http_response_code(400);
        $payload = ['error' => 'A senha deve ter pelo menos 6 caracteres'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // Valida CPF/CNPJ (formato básico)
    $cleanCpfCnpj = preg_replace('/[^0-9]/', '', $cpf_cnpj);
    if (strlen($cleanCpfCnpj) !== 11 && strlen($cleanCpfCnpj) !== 14) {
        Logger::warning('Invalid CPF/CNPJ format', ['cpf_cnpj' => $cpf_cnpj, 'clean_length' => strlen($cleanCpfCnpj)]);
        http_response_code(400);
        $payload = ['error' => 'CPF ou CNPJ inválido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // 4) Gera hash da senha
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    if (!$hashedPassword) {
        Logger::error('Failed to hash password');
        http_response_code(500);
        $payload = ['error' => 'Erro interno do servidor'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // 5) Verifica e-mail duplicado
    try {
        $check = $conn->prepare("SELECT id FROM users WHERE email = ?");
        if (!$check) {
            Logger::error('Failed to prepare email check statement', ['error' => $conn->error]);
            throw new Exception('Erro na preparação da consulta');
        }
        
        $check->bind_param("s", $email);
        $check->execute();
        $check->store_result();
        
        if ($check->num_rows > 0) {
            Logger::warning('Email already exists', ['email' => $email]);
            http_response_code(409); // Conflict
            $payload = ['error' => 'E-mail já cadastrado'];
            ob_clean();
            echo json_encode($payload);
            exit;
        }
        
        Logger::debug('Email availability check passed');
    } catch (Exception $e) {
        Logger::error('Database error during email check', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com o banco de dados');
    }

    // 6) Verifica CPF/CNPJ duplicado
    try {
        $checkCpf = $conn->prepare("SELECT id FROM users WHERE cpf_cnpj = ?");
        if (!$checkCpf) {
            Logger::error('Failed to prepare CPF/CNPJ check statement', ['error' => $conn->error]);
            throw new Exception('Erro na preparação da consulta');
        }
        
        $checkCpf->bind_param("s", $cpf_cnpj);
        $checkCpf->execute();
        $checkCpf->store_result();
        
        if ($checkCpf->num_rows > 0) {
            Logger::warning('CPF/CNPJ already exists', ['cpf_cnpj' => $cpf_cnpj]);
            http_response_code(409); // Conflict
            $payload = ['error' => 'CPF ou CNPJ já cadastrado'];
            ob_clean();
            echo json_encode($payload);
            exit;
        }
        
        Logger::debug('CPF/CNPJ availability check passed');
    } catch (Exception $e) {
        Logger::error('Database error during CPF/CNPJ check', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com o banco de dados');
    }

    // 7) Insere novo usuário
    try {
        $stmt = $conn->prepare(
            "INSERT INTO users (name, email, password_hash, cpf_cnpj, phone, role) VALUES (?, ?, ?, ?, ?, ?)"
        );
        
        if (!$stmt) {
            Logger::error('Failed to prepare insert statement', ['error' => $conn->error]);
            throw new Exception('Erro na preparação da inserção');
        }
        
        $stmt->bind_param("ssssss", $name, $email, $hashedPassword, $cpf_cnpj, $phone, $role);

        if ($stmt->execute()) {
            $userId = $conn->insert_id;
            Logger::info('User registered successfully', [
                'user_id' => $userId,
                'email' => $email,
                'role' => $role
            ]);
            $payload = ['success' => true];
        } else {
            Logger::error('Failed to execute insert statement', ['error' => $stmt->error]);
            http_response_code(500);
            $payload = ['error' => 'Erro ao criar conta'];
        }
    } catch (Exception $e) {
        Logger::error('Database error during user insertion', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com o banco de dados');
    }

    // 8) Limpa buffer e envia JSON
    ob_clean();
    echo json_encode($payload);
    
    Logger::info('Registration response sent successfully');
    
} catch (Throwable $e) {
    Logger::error('Unexpected error during registration', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao registrar usuário'
    ]);
    exit;
}
