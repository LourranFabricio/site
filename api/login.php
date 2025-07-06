<?php
// Inicia buffer de saída para capturar qualquer saída indesejada (warnings, HTML)
ob_start();

// Inclui o sistema de logs
require_once __DIR__ . '/../src/config/logger.php';
Logger::init();

// Desativa exibição de erros em produção para não misturar HTML na resposta JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Define que todas as respostas serão JSON
header('Content-Type: application/json; charset=utf-8');

// Log do início da requisição
Logger::access('Login attempt started', null, [
    'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'unknown'
]);

// Inclui as variáveis de conexão ao banco (definidas em src/config/db.php)
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
        Logger::warning('Invalid HTTP method for login', ['method' => $_SERVER['REQUEST_METHOD']]);
        http_response_code(405); // Método não permitido
        $payload = ['error' => 'Método não permitido'];
        ob_clean(); // Limpa qualquer saída anterior
        echo json_encode($payload);
        exit;
    }

    // 2) Lê o corpo cru da requisição (JSON enviado pelo fetch)
    $raw = file_get_contents('php://input');
    Logger::debug('Raw request body received', ['length' => strlen($raw)]);
    
    // Decodifica em array associativo
    $data = json_decode($raw, true);
    // Se houver erro de JSON, retorna 400
    if (json_last_error() !== JSON_ERROR_NONE) {
        Logger::error('Invalid JSON in login request', [
            'json_error' => json_last_error_msg(),
            'raw_data' => substr($raw, 0, 100) // Primeiros 100 caracteres para debug
        ]);
        http_response_code(400); // Bad Request
        $payload = ['error' => 'JSON inválido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    Logger::debug('JSON decoded successfully', ['fields' => array_keys($data)]);

    // 3) Extrai e valida campos obrigatórios
    $email    = $data['email']    ?? '';
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        Logger::warning('Missing required fields in login', [
            'email_provided' => !empty($email),
            'password_provided' => !empty($password)
        ]);
        http_response_code(400);
        $payload = ['error' => 'E-mail e senha são obrigatórios'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    // Valida formato do email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        Logger::warning('Invalid email format', ['email' => $email]);
        http_response_code(400);
        $payload = ['error' => 'Formato de e-mail inválido'];
        ob_clean();
        echo json_encode($payload);
        exit;
    }

    Logger::info('Login attempt for email', ['email' => $email]);

    // 4) Consulta segura usando prepared statements
    try {
        $stmt = $conn->prepare("SELECT id, password_hash, role, name, email FROM users WHERE email = ?");
        if (!$stmt) {
            Logger::error('Failed to prepare login statement', ['error' => $conn->error]);
            throw new Exception('Erro na preparação da consulta');
        }
        
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();
        $user   = $result->fetch_assoc();

        Logger::debug('Database query executed', ['user_found' => !empty($user)]);
    } catch (Exception $e) {
        Logger::error('Database error during login', ['error' => $e->getMessage()]);
        throw new Exception('Erro de conexão com o banco de dados');
    }

    // 5) Verifica senha e inicia sessão
    if ($user && password_verify($password, $user['password_hash'])) {
        // Inicia sessão
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $_SESSION['user'] = [
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role']
        ];
        
        Logger::info('Login successful', [
            'user_id' => $user['id'],
            'role' => $user['role'],
            'session_id' => session_id()
        ]);
        
        $payload = ['success' => true, 'role' => $user['role']];
    } else {
        Logger::warning('Login failed - invalid credentials', ['email' => $email]);
        http_response_code(401); // Unauthorized
        $payload = ['error' => 'Credenciais inválidas'];
    }

    // 6) Limpa buffer e envia apenas JSON puro
    ob_clean();
    echo json_encode($payload);
    
    Logger::info('Login response sent successfully');
    
} catch (Throwable $e) {
    Logger::error('Unexpected error during login', [
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    
    http_response_code(500);
    ob_clean();
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao fazer login'
    ]);
    exit;
}
