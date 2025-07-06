<?php
// src/model/User.php
require_once __DIR__ . '/../config/db.php';

class User {
    public static function create($name, $email, $password, $cpf_cnpj, $role = 'cliente', $phone = null) {
        $pdo = DB::getConnection();
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $sql = 'INSERT INTO users (name, email, password_hash, cpf_cnpj, role, phone) VALUES (?, ?, ?, ?, ?, ?)';
        $stmt = $pdo->prepare($sql);
        return $stmt->execute([$name, $email, $hash, $cpf_cnpj, $role, $phone]);
    }

    public static function authenticate($email, $password) {
        $pdo = DB::getConnection();
        $sql = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password_hash'])) {
            return $user;
        }
        return false;
    }
} 