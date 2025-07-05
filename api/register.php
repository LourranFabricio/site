<?php

// Inclui o sistema de logs e o controlador de registro
require_once __DIR__ . '/../src/config/logger.php';
require_once __DIR__ . '/../src/controller/RegisterController.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

try {
    // Lê os dados JSON enviados na requisição
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Valida se os dados foram recebidos corretamente
    if (!$data) {
        // Log de tentativa com dados inválidos
        Logger::warning('Tentativa de registro com dados inválidos');
        
        // Retorna erro para o cliente
        echo json_encode(['success' => false, 'message' => 'Dados inválidos.']);
        exit;
    }
    
    // Log da tentativa de registro (sem expor dados sensíveis)
    Logger::access('Tentativa de registro', null, [
        'email' => $data['email'] ?? 'unknown', 
        'role' => $data['role'] ?? 'unknown'
    ]);
    
    // Processa o registro através do controlador
    $result = RegisterController::register($data);
    
    // Log do resultado do registro
    if ($result['success']) {
        // Registro bem-sucedido
        Logger::access('Registro bem-sucedido', $result['user_id'] ?? null);
    } else {
        // Registro falhou - log do motivo
        Logger::warning('Registro falhou', [
            'email' => $data['email'] ?? 'unknown', 
            'reason' => $result['message'] ?? 'unknown'
        ]);
    }
    
    // Retorna o resultado para o cliente
    echo json_encode($result);
    
} catch (Exception $e) {
    // Log detalhado do erro para debug
    Logger::error('Erro no registro', [
        'error' => $e->getMessage(), 
        'trace' => $e->getTraceAsString()
    ]);
    
    // Retorna erro genérico para o cliente (não expõe detalhes internos)
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
} 