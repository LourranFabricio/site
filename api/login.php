<?php

// Inclui o sistema de logs e o controlador de login
require_once __DIR__ . '/../src/config/logger.php';
require_once __DIR__ . '/../src/controller/LoginController.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

try {
    // Lê os dados JSON enviados na requisição
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Valida se os dados foram recebidos corretamente
    if (!$data) {
        // Log de tentativa com dados inválidos
        Logger::warning('Tentativa de login com dados inválidos');
        
        // Retorna erro para o cliente
        echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
        exit;
    }
    
    // Log da tentativa de login (sem expor senha)
    Logger::access('Tentativa de login', null, ['email' => $data['email'] ?? 'unknown']);
    
    // Processa o login através do controlador
    $result = LoginController::login($data);
    
    // Log do resultado do login
    if ($result['success']) {
        // Login bem-sucedido
        Logger::access('Login bem-sucedido', $result['user_id'] ?? null);
    } else {
        // Login falhou - log do motivo
        Logger::warning('Login falhou', [
            'email' => $data['email'] ?? 'unknown', 
            'reason' => $result['message'] ?? 'unknown'
        ]);
    }
    
    // Retorna o resultado para o cliente
    echo json_encode($result);
    
} catch (Exception $e) {
    // Log detalhado do erro para debug
    Logger::error('Erro no login', [
        'error' => $e->getMessage(), 
        'trace' => $e->getTraceAsString()
    ]);
    
    // Retorna erro genérico para o cliente (não expõe detalhes internos)
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
} 