<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

// Inicia a sessão PHP
session_start();

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Verifica se o usuário está autenticado e é designer
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
        ob_clean();
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
    ob_clean();
    echo json_encode(['success' => true, 'specialties' => $specialties]);
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    exit;
} 