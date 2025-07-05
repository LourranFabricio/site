<?php
/**
 * Classe Logger - Sistema de Logs
 * 
 * Responsável por:
 * - Gerenciar logs de diferentes níveis
 * - Criar e manter arquivos de log
 * - Fornecer contexto detalhado para cada entrada
 * - Limpar logs antigos automaticamente
 */
class Logger {
    /** @var string|null Caminho para o arquivo de log */
    private static $logFile = null;
    
    /**
     * Inicializa o sistema de logs
     * 
     * Tenta criar um diretório de logs em diferentes locais possíveis.
     * Se não conseguir criar, usa error_log() do PHP como fallback.
     */
    public static function init() {
        // Lista de possíveis locais para o arquivo de log
        // Tenta diferentes diretórios para compatibilidade
        $possiblePaths = [
            __DIR__ . '/../../logs/app.log',                    // Raiz do projeto
            __DIR__ . '/../logs/app.log',                       // Um nível acima
            dirname($_SERVER['SCRIPT_FILENAME']) . '/logs/app.log' // Diretório do script atual
        ];
        
        // Tenta criar o diretório de logs em cada local possível
        foreach ($possiblePaths as $path) {
            $dir = dirname($path); // Obtém o diretório do arquivo
            
            // Se o diretório não existe, tenta criá-lo
            if (!is_dir($dir)) {
                if (mkdir($dir, 0755, true)) { // Cria diretório com permissões adequadas
                    self::$logFile = $path;
                    break; // Sai do loop se conseguiu criar
                }
            } else {
                // Se o diretório já existe, usa este caminho
                self::$logFile = $path;
                break;
            }
        }
        
        // Se não conseguiu criar nenhum diretório, usa error_log() como fallback
        if (!self::$logFile) {
            error_log("[LOGGER] Não foi possível criar arquivo de log, usando error_log padrão");
        }
    }
    
    /**
     * Log de informações gerais
     * 
     * @param string $message Mensagem a ser logada
     * @param array $context Contexto adicional (opcional)
     */
    public static function info($message, $context = []) {
        self::log('INFO', $message, $context);
    }
    
    /**
     * Log de avisos
     * 
     * @param string $message Mensagem a ser logada
     * @param array $context Contexto adicional (opcional)
     */
    public static function warning($message, $context = []) {
        self::log('WARNING', $message, $context);
    }
    
    /**
     * Log de erros
     * 
     * @param string $message Mensagem a ser logada
     * @param array $context Contexto adicional (opcional)
     */
    public static function error($message, $context = []) {
        self::log('ERROR', $message, $context);
    }
    
    /**
     * Log de debug
     * 
     * @param string $message Mensagem a ser logada
     * @param array $context Contexto adicional (opcional)
     */
    public static function debug($message, $context = []) {
        self::log('DEBUG', $message, $context);
    }
    
    /**
     * Log de acesso - para monitorar ações dos usuários
     * 
     * Captura automaticamente informações da requisição como IP,
     * User-Agent, método HTTP e URI.
     * 
     * @param string $action Ação realizada pelo usuário
     * @param int|null $userId ID do usuário (se disponível)
     * @param array $details Detalhes adicionais da ação
     */
    public static function access($action, $userId = null, $details = []) {
        // Combina informações padrão da requisição com detalhes específicos
        $context = array_merge([
            'user_id' => $userId,                                    // ID do usuário
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',            // IP do cliente
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown', // Navegador/dispositivo
            'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',     // Método HTTP (GET, POST, etc.)
            'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'            // URI acessada
        ], $details);
        
        self::log('ACCESS', $action, $context);
    }
    
    /**
     * Log de segurança - para monitorar eventos de segurança
     * 
     * Captura informações relevantes para auditoria de segurança.
     * 
     * @param string $event Evento de segurança
     * @param array $details Detalhes do evento
     */
    public static function security($event, $details = []) {
        // Combina informações de segurança com detalhes específicos
        $context = array_merge([
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',            // IP do cliente
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown', // Navegador/dispositivo
            'session_id' => session_id() ?? 'none'                   // ID da sessão
        ], $details);
        
        self::log('SECURITY', $event, $context);
    }
    
    /**
     * Método principal de log
     * 
     * Formata e escreve a entrada de log no arquivo ou usa error_log() como fallback.
     * 
     * @param string $level Nível do log (INFO, WARNING, ERROR, etc.)
     * @param string $message Mensagem a ser logada
     * @param array $context Contexto adicional
     */
    private static function log($level, $message, $context = []) {
        // Cria timestamp no formato padrão
        $timestamp = date('Y-m-d H:i:s');
        
        // Converte contexto em JSON se existir
        $contextStr = !empty($context) ? ' ' . json_encode($context) : '';
        
        // Formata a entrada de log completa
        $logEntry = "[$timestamp] [$level] $message$contextStr" . PHP_EOL;
        
        // Tenta escrever no arquivo de log se possível
        if (self::$logFile && is_writable(dirname(self::$logFile))) {
            // Usa LOCK_EX para evitar conflitos em escritas simultâneas
            file_put_contents(self::$logFile, $logEntry, FILE_APPEND | LOCK_EX);
        } else {
            // Fallback para error_log() do PHP
            error_log("[$level] $message$contextStr");
        }
    }
    
    /**
     * Limpa logs antigos (mais de 30 dias)
     * 
     * Remove entradas de log com mais de 30 dias para economizar espaço.
     * Útil para hospedagem gratuita com limitações de espaço.
     */
    public static function cleanup() {
        // Verifica se o arquivo de log existe
        if (!self::$logFile || !file_exists(self::$logFile)) {
            return;
        }
        
        // Lê todo o conteúdo do arquivo
        $logContent = file_get_contents(self::$logFile);
        $lines = explode(PHP_EOL, $logContent);
        
        // Calcula a data limite (30 dias atrás)
        $thirtyDaysAgo = strtotime('-30 days');
        $newLines = [];
        
        // Filtra apenas linhas recentes
        foreach ($lines as $line) {
            // Extrai timestamp da linha usando regex
            if (preg_match('/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]/', $line, $matches)) {
                $logTime = strtotime($matches[1]);
                
                // Mantém apenas linhas com menos de 30 dias
                if ($logTime > $thirtyDaysAgo) {
                    $newLines[] = $line;
                }
            }
        }
        
        // Reescreve o arquivo apenas com linhas recentes
        file_put_contents(self::$logFile, implode(PHP_EOL, $newLines));
        
        // Loga a limpeza realizada
        self::info('Logs antigos removidos');
    }
}

// Inicializa o logger automaticamente quando este arquivo é incluído
Logger::init(); 