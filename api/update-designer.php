<?php
session_start();
require_once __DIR__ . '/../src/config/db.php';
header('Content-Type: application/json');
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit;
}
$input = json_decode(file_get_contents('php://input'), true);
$bio = $input['bio'] ?? '';
$faixa_preco = $input['faixa_preco'] ?? '';
$specialties = $input['specialties'] ?? [];
$phone = $input['phone'] ?? null;
// Sanitizar faixa_preco para float
$faixa_preco = preg_replace('/[^\d.,]/', '', $faixa_preco);
$faixa_preco = str_replace(',', '.', $faixa_preco);
$faixa_preco = floatval($faixa_preco);
$pdo = DB::getConnection();
try {
    $pdo->beginTransaction();
    // Atualizar dados do designer
    $stmt = $pdo->prepare('UPDATE Users SET bio = ?, faixa_preco = ?, phone = ? WHERE id = ?');
    $stmt->execute([$bio, $faixa_preco, $phone, $_SESSION['user']['id']]);
    // Remover especialidades antigas
    $stmt = $pdo->prepare('DELETE FROM DesignerSpecialties WHERE designer_id = ?');
    $stmt->execute([$_SESSION['user']['id']]);
    // Adicionar novas especialidades
    if (!empty($specialties)) {
        $stmt = $pdo->prepare('INSERT INTO DesignerSpecialties (designer_id, specialty_id) VALUES (?, ?)');
        foreach ($specialties as $specialty_id) {
            $stmt->execute([$_SESSION['user']['id'], $specialty_id]);
        }
    }
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()]);
} 