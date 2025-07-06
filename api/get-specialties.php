<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Inicia a sessão PHP
session_start();

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

try {
    // Verifica se o usuário está autenticado e é designer
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
        exit;
    }

    // Obtém conexão com o banco de dados
    $pdo = DB::getConnection();

    // Busca as especialidades do designer logado
    // Faz JOIN entre specialties e designer_specialties para obter os dados
    $stmt = $pdo->prepare('SELECT s.id, s.name FROM specialties s JOIN designer_specialties ds ON s.id = ds.specialty_id WHERE ds.designer_id = ?');

    // Executa a consulta com o ID do designer logado
    $stmt->execute([$_SESSION['user']['id']]);

    // Obtém todas as especialidades do designer
    $specialties = $stmt->fetchAll();

    // Retorna as especialidades para o cliente
    echo json_encode(['success' => true, 'specialties' => $specialties]);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    exit;
} 