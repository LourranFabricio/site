<?php

// Inicia a sessão PHP
session_start();

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Verifica se o usuário está autenticado
if (!isset($_SESSION['user'])) {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}

// Lê os dados JSON enviados na requisição
$input = json_decode(file_get_contents('php://input'), true);

// Extrai a senha para confirmação da exclusão
$password = $input['password'] ?? '';

// Valida se a senha foi fornecida
if (!$password) {
    echo json_encode(['success' => false, 'message' => 'Senha não informada.']);
    exit;
}

// Obtém conexão com o banco de dados
$pdo = DB::getConnection();

// Obtém o ID do usuário logado
$userId = $_SESSION['user']['id'];

// Busca o hash da senha e role do usuário para validação
$stmt = $pdo->prepare('SELECT password_hash, role FROM Users WHERE id = ?');
$stmt->execute([$userId]);
$user = $stmt->fetch();

// Verifica se o usuário existe e se a senha está correta
if (!$user || !password_verify($password, $user['password_hash'])) {
    echo json_encode(['success' => false, 'message' => 'Senha incorreta.']);
    exit;
}

try {
    // Inicia transação para garantir consistência dos dados
    $pdo->beginTransaction();
    
    // Se for designer, remove dados relacionados específicos
    if ($user['role'] === 'designer') {
        // Busca e remove imagens do portfólio do servidor
        $stmt = $pdo->prepare('SELECT image_path FROM PortfolioImages WHERE designer_id = ?');
        $stmt->execute([$userId]);
        $images = $stmt->fetchAll();
        
        // Remove cada arquivo físico do servidor
        foreach ($images as $img) {
            $imagePath = __DIR__ . '/../' . $img['image_path'];
            if (file_exists($imagePath)) {
                unlink($imagePath);
            }
        }
        
        // Remove registros das imagens do portfólio do banco
        $stmt = $pdo->prepare('DELETE FROM PortfolioImages WHERE designer_id = ?');
        $stmt->execute([$userId]);
        
        // Remove especialidades do designer
        $stmt = $pdo->prepare('DELETE FROM DesignerSpecialties WHERE designer_id = ?');
        $stmt->execute([$userId]);
    }
    
    // Remove o usuário da tabela principal
    $stmt = $pdo->prepare('DELETE FROM Users WHERE id = ?');
    $stmt->execute([$userId]);
    
    // Confirma a transação
    $pdo->commit();
    
    // Destrói a sessão do usuário
    session_unset();
    session_destroy();
    
    // Retorna sucesso para o cliente
    echo json_encode(['success' => true, 'message' => 'Conta excluída com sucesso.']);
    
} catch (Exception $e) {
    // Em caso de erro, desfaz a transação
    $pdo->rollBack();
    
    // Retorna erro para o cliente
    echo json_encode(['success' => false, 'message' => 'Erro ao excluir conta: ' . $e->getMessage()]);
} 