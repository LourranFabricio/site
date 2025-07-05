<?php
/**
 * Carrega variáveis de ambiente do arquivo .env
 * 
 * Tenta encontrar o arquivo .env em diferentes locais e carrega
 * as variáveis de ambiente. Se não encontrar, usa configurações padrão.
 * 
 * @param string|null $path Caminho específico para o arquivo .env (opcional)
 */
function loadEnv($path = null) {
    // Lista de possíveis locais para o arquivo .env
    // Tenta diferentes diretórios para compatibilidade com diferentes setups
    $possiblePaths = [
        __DIR__ . '/../../.env',                           // Raiz do projeto
        __DIR__ . '/.env',                                 // Mesmo diretório deste arquivo
        dirname($_SERVER['SCRIPT_FILENAME']) . '/.env'     // Diretório do script atual
    ];
    
    // Se um caminho específico foi fornecido, usa apenas ele
    if ($path) {
        $possiblePaths = [$path];
    }
    
    // Tenta carregar o arquivo .env de cada local possível
    foreach ($possiblePaths as $envPath) {
        if (file_exists($envPath)) {
            // Lê todas as linhas do arquivo, ignorando linhas vazias
            $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            
            // Processa cada linha do arquivo
            foreach ($lines as $line) {
                // Pula linhas que começam com # (comentários)
                if (strpos(trim($line), '#') === 0) continue;
                
                // Pula linhas que não contêm = (não são variáveis)
                if (strpos($line, '=') === false) continue;
                
                // Divide a linha em nome e valor da variável
                list($name, $value) = array_map('trim', explode('=', $line, 2));
                
                // Só define a variável se ela ainda não existir
                if (!getenv($name)) {
                    putenv("{$name}={$value}");        // Define para getenv()
                    $_ENV[$name] = $value;             // Define para $_ENV
                    $_SERVER[$name] = $value;          // Define para $_SERVER
                }
            }
            
            // Log de sucesso
            error_log("[ENV] Arquivo .env carregado de: $envPath");
            return; // Sai da função após carregar com sucesso
        }
    }
    
    // Configurações padrão para hospedagem gratuita
    // Usadas quando não há arquivo .env disponível
    $defaults = [
        'DB_HOST' => 'localhost',                    // Host do banco de dados
        'DB_NAME' => 'brandge_db',                   // Nome do banco de dados
        'DB_USER' => 'root',                         // Usuário do banco
        'DB_PASS' => '',                             // Senha do banco (vazia para hospedagem gratuita)
        'UPLOAD_MAX_SIZE' => '5242880',              // Tamanho máximo de upload (5MB)
        'ALLOWED_EXTENSIONS' => 'jpg,jpeg,png,gif,webp' // Extensões permitidas para upload
    ];
    
    // Define as configurações padrão se não existirem
    foreach ($defaults as $key => $value) {
        if (!getenv($key)) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }
    
    // Log informando que está usando configurações padrão
    error_log("[ENV] Usando configurações padrão para hospedagem gratuita");
}

// Carrega automaticamente as variáveis de ambiente quando este arquivo é incluído
loadEnv(); 