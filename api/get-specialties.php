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

// Busca as especialidades do designer logado
// Faz JOIN entre Specialties e DesignerSpecialties para obter os dados
$stmt = $pdo->prepare('SELECT s.id, s.name FROM Specialties s JOIN DesignerSpecialties ds ON s.id = ds.specialty_id WHERE ds.designer_id = ?');

// Executa a consulta com o ID do designer logado
$stmt->execute([$_SESSION['user']['id']]);

// Obtém todas as especialidades do designer
$specialties = $stmt->fetchAll();

// Retorna as especialidades para o cliente
echo json_encode(['success' => true, 'specialties' => $specialties]); 