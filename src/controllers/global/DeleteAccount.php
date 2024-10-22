<?php

session_start();

if (!defined('DB_SERVER')) {
    define('DB_SERVER', '185.173.111.184');
}
if (!defined('DB_USERNAME')) {
    define('DB_USERNAME', 'u858577505_trabalhoamigo');
}
if (!defined('DB_PASSWORD')) {
    define('DB_PASSWORD', '@#Trabalhoamigo023@_');
}
if (!defined('DB_NAME')) {
    define('DB_NAME', 'u858577505_trabalhoamigo');
}

$conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
    
if ($conn->connect_error) {
    throw new Exception('Falha na conexão com o banco de dados: ' . $conn->connect_error);
}

if (isset($_SESSION['id_usuario'])) {
    $userId = $_SESSION['id_usuario'];
    error_log("ID do usuário: $userId"); // Log para depuração

    // Prepare a consulta para excluir o usuário
    $query = "DELETE FROM usuarios WHERE id_usuario = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {

        // Deleta os dados da session ativa
        session_destroy();

        echo json_encode(['status' => 'success']);
    } else {
        error_log("Erro ao executar a consulta: " . $stmt->error); // Log para depuração
        echo json_encode(['status' => 'error', 'message' => 'Erro ao excluir a conta.']);
    }
    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Usuário não autenticado.']);
}

$conn->close();
