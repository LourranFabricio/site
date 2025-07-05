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

// Extrai os dados do formulário com valores padrão
$name = $input['name'] ?? '';                    // Nome do usuário
$email = $input['email'] ?? '';                  // Email do usuário
$phone = $input['phone'] ?? '';                  // Telefone do usuário
$bio = $input['description'] ?? '';              // Biografia do usuário
$currentPassword = $input['currentPassword'] ?? null;  // Senha atual (para troca)
$newPassword = $input['newPassword'] ?? null;    // Nova senha (para troca)
$specialties = $input['specialties'] ?? null;    // Especialidades (designers)

// Obtém conexão com o banco de dados
$pdo = DB::getConnection();

try {
    // Se for designer e especialidades foram enviadas, processa dados completos
    if ($_SESSION['user']['role'] === 'designer' && is_array($specialties)) {
        // Atualiza dados básicos do usuário
        $stmt = $pdo->prepare('UPDATE Users SET name = ?, email = ?, phone = ?, bio = ? WHERE id = ?');
        $stmt->execute([$name, $email, $phone, $bio, $_SESSION['user']['id']]);
        
        // Remove especialidades antigas do designer
        $stmt = $pdo->prepare('DELETE FROM DesignerSpecialties WHERE designer_id = ?');
        $stmt->execute([$_SESSION['user']['id']]);
        
        // Insere as novas especialidades selecionadas
        if (!empty($specialties)) {
            $stmt = $pdo->prepare('INSERT INTO DesignerSpecialties (designer_id, specialty_id) VALUES (?, ?)');
            foreach ($specialties as $specialty_id) {
                $stmt->execute([$_SESSION['user']['id'], $specialty_id]);
            }
        }
        
        // Processa troca de senha se fornecida
        if ($currentPassword && $newPassword) {
            // Verifica se a senha atual está correta
            $stmt = $pdo->prepare('SELECT password_hash FROM Users WHERE id = ?');
            $stmt->execute([$_SESSION['user']['id']]);
            $user = $stmt->fetch();
            
            if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
                echo json_encode(['success' => false, 'message' => 'Senha atual incorreta.']);
                exit;
            }
            
            // Gera hash da nova senha e atualiza no banco
            $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('UPDATE Users SET password_hash = ? WHERE id = ?');
            $stmt->execute([$newHash, $_SESSION['user']['id']]);
        }
        
        // Retorna sucesso para designer com especialidades
        echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);
        exit;
    }
    
    // Se for cliente ou designer sem especialidades, processa apenas dados básicos e senha
    if ($currentPassword && $newPassword) {
        // Verifica se a senha atual está correta
        $stmt = $pdo->prepare('SELECT password_hash FROM Users WHERE id = ?');
        $stmt->execute([$_SESSION['user']['id']]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($currentPassword, $user['password_hash'])) {
            echo json_encode(['success' => false, 'message' => 'Senha atual incorreta.']);
            exit;
        }
        
        // Gera hash da nova senha e atualiza no banco
        $newHash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare('UPDATE Users SET password_hash = ? WHERE id = ?');
        $stmt->execute([$newHash, $_SESSION['user']['id']]);
    }
    
    // Atualiza dados básicos do usuário
    $stmt = $pdo->prepare('UPDATE Users SET name = ?, email = ?, phone = ?, bio = ? WHERE id = ?');
    $stmt->execute([$name, $email, $phone, $bio, $_SESSION['user']['id']]);
    
    // Retorna sucesso
    echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso!']);
    
} catch (Exception $e) {
    // Retorna erro em caso de exceção
    echo json_encode(['success' => false, 'message' => 'Erro ao atualizar perfil: ' . $e->getMessage()]);
} 