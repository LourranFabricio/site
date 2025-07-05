<?php

// Inclui a configuração do banco de dados
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Obtém conexão com o banco de dados
$pdo = DB::getConnection();

// Busca todos os designers cadastrados no sistema
// Seleciona apenas usuários com role = 'designer'
$designers = $pdo->query("SELECT id, name, email, phone, bio, faixa_preco FROM Users WHERE role = 'designer'")->fetchAll();

// Busca especialidades de todos os designers
// Faz JOIN entre DesignerSpecialties e Specialties para obter os nomes
$specStmt = $pdo->query('SELECT ds.designer_id, s.name FROM DesignerSpecialties ds JOIN Specialties s ON ds.specialty_id = s.id');
$specialties = [];

// Organiza as especialidades por designer_id
foreach ($specStmt as $row) {
    $specialties[$row['designer_id']][] = $row['name'];
}

// Busca imagens de portfólio de todos os designers
// Obtém o caminho das imagens para cada designer
$imgStmt = $pdo->query('SELECT designer_id, image_path FROM PortfolioImages');
$portfolio = [];

// Organiza as imagens por designer_id
foreach ($imgStmt as $row) {
    $portfolio[$row['designer_id']][] = $row['image_path'];
}

// Monta a resposta final combinando todos os dados
foreach ($designers as &$designer) {
    // Adiciona especialidades do designer (array vazio se não tiver)
    $designer['specialties'] = $specialties[$designer['id']] ?? [];
    
    // Adiciona imagens do portfólio (array vazio se não tiver)
    $designer['portfolio'] = $portfolio[$designer['id']] ?? [];
}

// Remove a referência para evitar problemas de memória
unset($designer);

// Retorna a lista completa de designers com seus dados
echo json_encode(['success' => true, 'designers' => $designers]); 