<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

// Inicia a sessão PHP
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Define o tipo de resposta como JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Verifica se existe uma sessão de usuário ativa
    if (isset($_SESSION['user'])) {
        // Inclui a configuração do banco de dados
        require_once __DIR__ . '/../src/config/db.php';
        
        // Obtém conexão com o banco de dados
        $pdo = DB::getConnection();
        
        // Prepara consulta para buscar dados do usuário
        // Usa prepared statement para segurança contra SQL injection
        $stmt = $pdo->prepare('SELECT id, name, email, phone, bio, role FROM users WHERE id = ?');
        
        // Executa a consulta com o ID do usuário da sessão
        $stmt->execute([$_SESSION['user']['id']]);
        
        // Busca os dados do usuário
        $user = $stmt->fetch();
        
        // Verifica se o usuário foi encontrado no banco
        if ($user) {
            ob_clean();
            // Usuário encontrado - retorna dados da sessão
            echo json_encode([
                'success' => true,           // Operação bem-sucedida
                'logged_in' => true,         // Confirma que está logado
                'role' => $user['role'],     // Papel do usuário (cliente/designer)
                'user' => $user              // Dados completos do usuário
            ]);
        } else {
            ob_clean();
            // Usuário não encontrado no banco (sessão inválida)
            echo json_encode(['success' => false, 'message' => 'Usuário não encontrado']);
        }
    } else {
        ob_clean();
        // Não há sessão ativa - usuário não está logado
        echo json_encode(['success' => false, 'message' => 'Não logado']);
    }
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    exit;
} 