<?php
ob_start();
ini_set('display_errors', 0);
error_reporting(0);

// Inicia a sessão PHP
session_start();

// Define o tipo de resposta como JSON
header('Content-Type: application/json; charset=utf-8');

try {
    // Verifica se o usuário está autenticado e é designer
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
        ob_clean();
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
        exit;
    }

    // Inclui a configuração do banco de dados
    require_once __DIR__ . '/../src/config/db.php';

    // Obtém conexão com o banco de dados
    $pdo = DB::getConnection();

    // Busca as imagens do portfólio do designer logado
    $stmt = $pdo->prepare('SELECT id, image_path FROM portfolio_images WHERE designer_id = ? ORDER BY created_at DESC');
    $stmt->execute([$_SESSION['user']['id']]);
    $images = $stmt->fetchAll();

    // Adapta para o frontend esperar "filename"
    foreach ($images as &$img) {
        $img['filename'] = $img['image_path'];
        unset($img['image_path']);
    }

    ob_clean();
    // Retorna as imagens do portfólio para o cliente
    echo json_encode(['success' => true, 'images' => $images]);
} catch (Throwable $e) {
    http_response_code(500);
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
    exit;
} 