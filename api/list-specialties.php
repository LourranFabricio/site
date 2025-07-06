<?php

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Obtém conexão com o banco de dados
try {
    $pdo = DB::getConnection();
    $stmt = $pdo->query('SELECT id, name FROM specialties');
    $specialties = $stmt->fetchAll();
    echo json_encode(['success' => true, 'specialties' => $specialties]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao listar especialidades',
        'details' => $e->getMessage()
    ]);
    exit;
} 