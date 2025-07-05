<?php
// src/controller/RegisterController.php
require_once __DIR__ . '/../model/User.php';

class RegisterController {
    public static function register($data) {
        // Validação básica
        if (empty($data['name']) || empty($data['email']) || empty($data['password']) || empty($data['cpf_cnpj'])) {
            return ['success' => false, 'message' => 'Todos os campos são obrigatórios.'];
        }
        // Email válido
        if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            return ['success' => false, 'message' => 'Email inválido.'];
        }
        // Tenta cadastrar
        try {
            $role = isset($data['role']) && in_array($data['role'], ['cliente', 'designer']) ? $data['role'] : 'cliente';
            $phone = isset($data['phone']) ? $data['phone'] : null;
            $ok = User::create($data['name'], $data['email'], $data['password'], $data['cpf_cnpj'], $role, $phone);
            if ($ok) {
                return ['success' => true, 'message' => 'Usuário cadastrado com sucesso!'];
            } else {
                return ['success' => false, 'message' => 'Erro ao cadastrar usuário.'];
            }
        } catch (PDOException $e) {
            if (str_contains($e->getMessage(), 'Duplicate')) {
                return ['success' => false, 'message' => 'Email ou CPF/CNPJ já cadastrado.'];
            }
            return ['success' => false, 'message' => 'Erro: ' . $e->getMessage()];
        }
    }
} 