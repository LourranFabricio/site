<?php
// Inclui o sistema de logs se disponível
if (file_exists(__DIR__ . '/logger.php')) {
    require_once __DIR__ . '/logger.php';
    Logger::init();
}

require_once __DIR__ . '/env.php';

class DB {
    private static $pdo = null;
    
    public static function getConnection() {
        global $dbHost, $dbUser, $dbPass, $dbName;
        
        if (self::$pdo === null) {
            try {
                $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=utf8mb4";
                self::$pdo = new PDO($dsn, $dbUser, $dbPass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
                ]);
                
                if (class_exists('Logger')) {
                    Logger::info('PDO connection established successfully');
                }
            } catch (PDOException $e) {
                if (class_exists('Logger')) {
                    Logger::error('PDO connection failed', [
                        'error' => $e->getMessage(),
                        'host' => $dbHost,
                        'database' => $dbName
                    ]);
                }
                
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados']);
                exit;
            }
        }
        return self::$pdo;
    }
}

// Manter compatibilidade com código existente que usa $conn
try {
    $conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    
    // Configura charset para UTF-8
    if (!$conn->set_charset("utf8mb4")) {
        if (class_exists('Logger')) {
            Logger::error('Failed to set charset to utf8mb4', ['error' => $conn->error]);
        }
    }
    
    // Exibir erro claro se falhar
    if ($conn->connect_error) {
        if (class_exists('Logger')) {
            Logger::error('MySQLi connection failed', [
                'error' => $conn->connect_error,
                'host' => $dbHost,
                'database' => $dbName
            ]);
        }
        
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados']);
        exit;
    }
    
    if (class_exists('Logger')) {
        Logger::info('MySQLi connection established successfully');
    }
    
} catch (Exception $e) {
    if (class_exists('Logger')) {
        Logger::error('Exception during MySQLi connection', [
            'error' => $e->getMessage(),
            'host' => $dbHost,
            'database' => $dbName
        ]);
    }
    
    header('Content-Type: application/json; charset=utf-8');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro de configuração do banco de dados']);
    exit;
}
