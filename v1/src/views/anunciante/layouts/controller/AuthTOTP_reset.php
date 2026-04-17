<?php
session_start();

// Verifica se a requisição é POST e se o parâmetro 'reset_totp' foi enviado
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reset_totp'])) {
    header('Content-Type: application/json'); // Define o tipo de conteúdo da resposta como JSON
    
    // Verifica se o usuário está logado
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['success' => false, 'message' => 'Usuário não está logado.']);
        exit;
    }

    $id_usuario = $_SESSION['id_usuario']; 
    
    require_once __DIR__ . '/../../../../../config/config.php';

    // Conexão com o banco de dados
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Verifica se houve erro na conexão
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.']);
        exit;
    }

    // Atualiza o status do TOTP para inativo e limpa o segredo
    $sql = "UPDATE usuarios SET totp_enabled = 0, totp_secret = NULL WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        $stmt->bind_param("i", $id_usuario);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Autenticação de dois fatores resetada com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao alterar a autenticação de dois fatores.']);
        }
        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao preparar a consulta SQL.']);
    }

    $conn->close();
    exit;
}
