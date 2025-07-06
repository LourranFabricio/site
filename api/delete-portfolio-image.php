<?php

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

    // Aceita ID via POST tradicional ou JSON para compatibilidade
    $input = json_decode(file_get_contents('php://input'), true);
    $id = null;

    // Tenta obter o ID do JSON primeiro
    if (isset($input['id'])) {
        $id = intval($input['id']);
    } 
    // Se não encontrar no JSON, tenta no POST tradicional
    elseif (isset($_POST['id'])) {
        $id = intval($_POST['id']);
    } 
    // Se não encontrar em nenhum lugar, define como 0 (inválido)
    else {
        $id = 0;
    }

    // Valida se o ID é válido (maior que 0)
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID inválido.']);
        exit;
    }

    // Obtém conexão com o banco de dados
    $pdo = DB::getConnection();

    // Verifica se a imagem existe e pertence ao designer logado
    // Isso garante que um designer não possa excluir imagens de outro designer
    $stmt = $pdo->prepare('SELECT * FROM portfolio_images WHERE id = ? AND designer_id = ?');
    $stmt->execute([$id, $_SESSION['user']['id']]);
    $image = $stmt->fetch();

    // Se a imagem não foi encontrada ou não pertence ao designer
    if (!$image) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Imagem não encontrada ou não pertence a você.']);
        exit;
    }

    // Remove o registro da imagem do banco de dados
    $stmt = $pdo->prepare('DELETE FROM portfolio_images WHERE id = ?');
    $stmt->execute([$id]);

    // Remove o arquivo físico do servidor
    $imagePath = __DIR__ . '/../' . $image['image_path'];

    // Verifica se o arquivo existe antes de tentar removê-lo
    if (file_exists($imagePath)) {
        unlink($imagePath);
    }

    // Retorna sucesso para o cliente
    echo json_encode(['success' => true, 'message' => 'Imagem excluída com sucesso.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao excluir imagem do portfólio',
        'details' => $e->getMessage()
    ]);
    exit;
} 