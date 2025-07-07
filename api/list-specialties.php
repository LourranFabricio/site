<?php

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Obtém conexão com o banco de dados
$pdo = DB::getConnection();

// Busca todas as especialidades cadastradas na tabela specialties
$stmt = $pdo->query('SELECT id, name FROM specialties');

// Obtém todos os resultados como array associativo
$specialties = $stmt->fetchAll();

// Retorna a lista de especialidades para o cliente
echo json_encode(['success' => true, 'specialties' => $specialties]); 