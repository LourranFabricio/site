<?php

// Inicia a sessão PHP
session_start();

// Inclui o sistema de logs e configuração do banco
require_once __DIR__ . '/../src/config/logger.php';
require_once __DIR__ . '/../src/config/db.php';

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

try {
    // Verifica se o usuário está autenticado e é designer
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'designer') {
        // Log de tentativa de acesso não autorizado
        Logger::security('Tentativa de upload sem autorização', ['user_id' => $_SESSION['user']['id'] ?? 'none']);
        echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
        exit;
    }

    // Verifica se foram enviados arquivos na requisição
    if (!isset($_FILES['portfolio_files'])) {
        // Log de tentativa sem arquivos
        Logger::warning('Tentativa de upload sem arquivos', ['user_id' => $_SESSION['user']['id']]);
        echo json_encode(['success' => false, 'message' => 'Nenhum arquivo enviado.']);
        exit;
    }

    // Obtém conexão com o banco de dados
    $pdo = DB::getConnection();

    // Configurações de upload compatíveis com hospedagem gratuita
    $uploadDir = __DIR__ . '/../assets/img/'; // Agora salva em assets/img
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']; // Tipos MIME permitidos
    $maxSize = getenv('UPLOAD_MAX_SIZE') ?: 5 * 1024 * 1024;              // Tamanho máximo (5MB padrão)

    // Tenta criar o diretório de upload se não existir
    if (!is_dir($uploadDir)) {
        if (!mkdir($uploadDir, 0755, true)) {
            // Log de erro se não conseguir criar o diretório
            Logger::error('Não foi possível criar diretório de upload', ['path' => $uploadDir]);
            echo json_encode(['success' => false, 'message' => 'Erro interno do servidor.']);
            exit;
        }
    }

    // Arrays para armazenar resultados
    $uploadedFiles = []; // Arquivos enviados com sucesso
    $errors = [];        // Erros encontrados durante o upload

    // Processa cada arquivo enviado
    foreach ($_FILES['portfolio_files']['tmp_name'] as $key => $tmp_name) {
        $fileName = $_FILES['portfolio_files']['name'][$key];
        
        // Verifica se houve erro no upload do arquivo
        if ($_FILES['portfolio_files']['error'][$key] !== UPLOAD_ERR_OK) {
            $errors[] = 'Erro no upload do arquivo ' . ($key + 1);
            Logger::warning('Erro no upload', ['file' => $fileName, 'error' => $_FILES['portfolio_files']['error'][$key]]);
            continue; // Pula para o próximo arquivo
        }
        
        // Obtém informações do arquivo
        $fileSize = $_FILES['portfolio_files']['size'][$key];
        $fileType = $_FILES['portfolio_files']['type'][$key];
        
        // Validação de tipo MIME declarado
        if (!in_array($fileType, $allowedTypes)) {
            $errors[] = 'Tipo de arquivo não permitido: ' . $fileName;
            Logger::security('Tentativa de upload de tipo inválido', ['file' => $fileName, 'type' => $fileType]);
            continue;
        }
        
        // Validação de tamanho do arquivo
        if ($fileSize > $maxSize) {
            $errors[] = 'Arquivo muito grande: ' . $fileName;
            Logger::warning('Arquivo muito grande', ['file' => $fileName, 'size' => $fileSize, 'max' => $maxSize]);
            continue;
        }
        
        // Validação adicional de segurança - verifica o tipo MIME real do arquivo
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $realType = finfo_file($finfo, $tmp_name);
        finfo_close($finfo);
        
        // Compara o tipo MIME real com os tipos permitidos
        if (!in_array($realType, $allowedTypes)) {
            $errors[] = 'Tipo de arquivo inválido: ' . $fileName;
            Logger::security('Tentativa de upload com tipo MIME falso', [
                'file' => $fileName, 
                'claimed_type' => $fileType, 
                'real_type' => $realType
            ]);
            continue;
        }
        
        // Gera nome único para o arquivo para evitar conflitos
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $filename = uniqid() . '.' . $extension;
        $filepath = $uploadDir . $filename;
        
        // Move o arquivo temporário para o diretório final
        if (move_uploaded_file($tmp_name, $filepath)) {
            // Arquivo movido com sucesso
            $uploadedFiles[] = 'assets/img/' . $filename;
            Logger::info('Arquivo enviado com sucesso', ['file' => $filename, 'user_id' => $_SESSION['user']['id']]);
        } else {
            // Erro ao mover o arquivo
            $errors[] = 'Erro ao salvar arquivo: ' . $fileName;
            Logger::error('Falha ao mover arquivo', ['file' => $fileName, 'path' => $filepath]);
        }
    }

    // Se houve erros durante o upload, retorna os erros
    if (!empty($errors)) {
        Logger::warning('Upload com erros', ['errors' => $errors, 'user_id' => $_SESSION['user']['id']]);
        echo json_encode(['success' => false, 'message' => 'Erros: ' . implode(', ', $errors)]);
        exit;
    }

    // Salva as informações dos arquivos no banco de dados
    try {
        // Inicia transação para garantir consistência
        $pdo->beginTransaction();
        
        // Prepara statement para inserir imagens do portfólio
        $stmt = $pdo->prepare('INSERT INTO portfolio_images (designer_id, image_path, ordem, created_at) VALUES (?, ?, ?, NOW())');
        
        // Insere cada arquivo no banco
        foreach ($uploadedFiles as $index => $filepath) {
            $ordem = 1; // ou use $index+1 se quiser ordem incremental
            $stmt->execute([$_SESSION['user']['id'], $filepath, $ordem]);
        }
        
        // Confirma a transação
        $pdo->commit();
        
        // Log de sucesso com detalhes do upload
        Logger::access('Upload de portfólio bem-sucedido', $_SESSION['user']['id'], [
            'files_count' => count($uploadedFiles),
            'files' => $uploadedFiles
        ]);
        
        // Retorna sucesso para o cliente
        echo json_encode(['success' => true, 'message' => count($uploadedFiles) . ' imagem(ns) enviada(s) com sucesso!']);
        
    } catch (Exception $e) {
        // Em caso de erro, desfaz a transação
        $pdo->rollBack();
        
        // Log detalhado do erro
        Logger::error('Erro ao salvar upload no banco', [
            'error' => $e->getMessage(),
            'user_id' => $_SESSION['user']['id'],
            'files' => $uploadedFiles
        ]);
        
        // Retorna erro para o cliente
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro ao salvar no banco: ' . $e->getMessage()]);
    }
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro inesperado ao fazer upload de portfólio',
        'details' => $e->getMessage()
    ]);
    exit;
} 