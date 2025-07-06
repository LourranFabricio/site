<?php
session_start();
require_once __DIR__ . '/../src/config/db.php';
header('Content-Type: application/json');

try {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $bio = $input['bio'] ?? '';
    $specialties = $input['specialties'] ?? [];
    $phone = $input['phone'] ?? null;
    $pdo = DB::getConnection();
    $pdo->beginTransaction();
    $stmt = $pdo->prepare('UPDATE users SET bio = ?, phone = ? WHERE id = ?');
    $stmt->execute([$bio, $phone, $_SESSION['user']['id']]);
    $stmt = $pdo->prepare('DELETE FROM designer_specialties WHERE designer_id = ?');
    $stmt->execute([$_SESSION['user']['id']]);
    if (!empty($specialties)) {
        $stmt = $pdo->prepare('INSERT INTO designer_specialties (designer_id, specialty_id) VALUES (?, ?)');
        foreach ($specialties as $specialty_id) {
            $stmt->execute([$_SESSION['user']['id'], $specialty_id]);
        }
    }
    $pdo->commit();
    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao atualizar perfil de designer',
        'details' => $e->getMessage()
    ]);
    exit;
} 