<?php

// Inicia a sessão PHP (necessário para destruí-la)
session_start();

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

try {
    // Remove todas as variáveis da sessão
    session_unset();

    // Destrói completamente a sessão
    session_destroy();

    // Retorna confirmação de logout bem-sucedido
    echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao fazer logout',
        'details' => $e->getMessage()
    ]);
    exit;
} 