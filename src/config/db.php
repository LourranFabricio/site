<?php
// Inclui o arquivo de configuração de ambiente
require_once __DIR__ . '/env.php';
class DB {
    /** @var PDO|null Instância única da conexão (Singleton) */
    private static $instance = null;

    /**
     * Obtém a conexão com o banco de dados
     * 
     * Se a conexão não existir, cria uma nova usando as configurações
     * do ambiente ou valores padrão para hospedagem gratuita.
     * 
     * @return PDO Conexão ativa com o banco de dados
     * @throws Exception Se não conseguir conectar ao banco
     */
    public static function getConnection() {
        // Verifica se já existe uma instância da conexão
        if (self::$instance === null) {
            // Obtém configurações do ambiente com fallbacks para hospedagem gratuita
            $host = getenv('DB_HOST') ?: 'localhost';      // Host do banco
            $dbname = getenv('DB_NAME') ?: 'brandge_db';   // Nome do banco
            $user = getenv('DB_USER') ?: 'root';           // Usuário do banco
            $pass = getenv('DB_PASS') ?: '';               // Senha do banco
            
            try {
                // Cria a string de conexão DSN (Data Source Name)
                $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
                
                // Cria a instância PDO com configurações de segurança
                self::$instance = new PDO($dsn, $user, $pass, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,        // Lança exceções em caso de erro
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,   // Retorna arrays associativos por padrão
                    PDO::ATTR_EMULATE_PREPARES => false                 // Usa prepared statements nativos
                ]);
                
                // Log de sucesso para monitoramento
                error_log("[DB] Conexão estabelecida com sucesso para $dbname em $host");
                
            } catch (PDOException $e) {
                // Log do erro para debug
                error_log("[DB] Erro de conexão: " . $e->getMessage());
                
                // Lança exceção genérica para não expor detalhes do banco
                throw new Exception("Erro de conexão com o banco de dados");
            }
        }
        
        // Retorna a instância da conexão
        return self::$instance;
    }
} 