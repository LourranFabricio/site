<?php
// Arquivo de teste para verificar conexão com banco de dados
header('Content-Type: application/json; charset=utf-8');

// Inclui o sistema de logs
require_once __DIR__ . '/../src/config/logger.php';
Logger::init();

try {
    // Inclui configuração do banco
    require_once __DIR__ . '/../src/config/db.php';
    
    // Testa conexão MySQLi
    if ($conn && $conn->ping()) {
        Logger::info('Database connection test successful');
        echo json_encode([
            'success' => true,
            'message' => 'Conexão com banco de dados OK',
            'server_info' => $conn->server_info,
            'charset' => $conn->character_set_name()
        ]);
    } else {
        Logger::error('Database connection test failed');
        echo json_encode([
            'success' => false,
            'message' => 'Falha na conexão com banco de dados'
        ]);
    }
    
} catch (Exception $e) {
    Logger::error('Exception during connection test', ['error' => $e->getMessage()]);
    echo json_encode([
        'success' => false,
        'message' => 'Erro durante teste de conexão',
        'error' => $e->getMessage()
    ]);
} 