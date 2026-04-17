<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ativar_totp'])) {
    header('Content-Type: application/json');
    $ativarTOTP = $_POST['ativar_totp']; 
    $id_usuario = $_SESSION['id_usuario']; 
    
    require_once __DIR__ . '/../../../../../config/config.php';

    // Conexão com o banco de dados
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Verifica se houve erro na conexão
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.']);
        exit;
    }

    $status = $_POST['ativar_totp'];

    $sql = "UPDATE usuarios SET totp_enabled = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("ii", $status, $id_usuario);
        
        if ($stmt->execute()) {
            if ($status == 1) {
                echo json_encode(['success' => true, 'message' => 'Autenticação de dois fatores ativada com sucesso.']);
            } else {
                echo json_encode(['success' => true, 'message' => 'Autenticação de dois fatores desativada com sucesso.']);
            }
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
