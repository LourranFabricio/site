<?php
// src/controller/LoginController.php
require_once __DIR__ . '/../model/User.php';

class LoginController {
    public static function login($data) {
        if (empty($data['email']) || empty($data['password'])) {
            return ['success' => false, 'message' => 'Email e senha são obrigatórios.'];
        }
        $user = User::authenticate($data['email'], $data['password']);
        if ($user) {
            // Iniciar sessão
            session_start();
            $_SESSION['user'] = $user;
            
            // Determinar redirecionamento baseado no role
            $redirect = $user['role'] === 'designer' ? 'profile.html' : 'index.html';
            
            return [
                'success' => true, 
                'message' => 'Usuário logado com sucesso!',
                'role' => $user['role'],
                'redirect' => $redirect
            ];
        } else {
            return ['success' => false, 'message' => 'Email ou senha inválidos.'];
        }
    }
} 