<?php

// Inicia a sessão PHP (necessário para destruí-la)
session_start();

// Remove todas as variáveis da sessão
session_unset();

// Destrói completamente a sessão
session_destroy();

// Define o tipo de resposta como JSON
header('Content-Type: application/json');

// Retorna confirmação de logout bem-sucedido
echo json_encode(['success' => true, 'message' => 'Logout realizado com sucesso.']); 