<?php

// Inicia a sessão PHP
session_start();

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Verifica se o usuário está autenticado e é designer
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}

// Obtém conexão com o banco de dados
$pdo = DB::getConnection();

// Busca as imagens do portfólio do designer logado
// Ordena por ordem (campo personalizado) e depois por ID
$stmt = $pdo->prepare('SELECT id, image_path FROM PortfolioImages WHERE designer_id = ? ORDER BY ordem, id');

// Executa a consulta com o ID do designer logado
$stmt->execute([$_SESSION['user']['id']]);

// Obtém todas as imagens do portfólio
$images = $stmt->fetchAll();

// Retorna as imagens do portfólio para o cliente
echo json_encode(['success' => true, 'images' => $images]); 