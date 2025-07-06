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

// Busca os dados específicos do designer logado
// Seleciona campos relevantes para o perfil do designer
$stmt = $pdo->prepare('SELECT id, name, email, phone, bio FROM users WHERE id = ?');

// Executa a consulta com o ID do designer logado
$stmt->execute([$_SESSION['user']['id']]);

// Obtém os dados do designer
$designer = $stmt->fetch();

// Retorna os dados do designer para o cliente
echo json_encode(['success' => true, 'designer' => $designer]); 