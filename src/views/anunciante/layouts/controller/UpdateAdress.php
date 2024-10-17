<?php
// Inicia a sessão
if (!isset($_SESSION)) {
    session_start();
}

// Verifica se o formulário foi enviado via POST para atualizar o endereço
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rua'], $_POST['cep'])) {
    header('Content-Type: application/json');

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

    // Conexão com o banco de dados
    $conn = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);

    // Verifica se houve erro na conexão
    if ($conn->connect_error) {
        echo json_encode(['success' => false, 'message' => 'Falha na conexão com o banco de dados.']);
        exit;
    }

    // Verifica se o usuário está logado
    if (!isset($_SESSION['id_usuario'])) {
        echo json_encode(['success' => false, 'message' => 'Usuário não autenticado.']);
        exit;
    }

    // Filtra e obtém os dados do formulário
    $id_usuario = $_SESSION['id_usuario'];
    $rua = $conn->real_escape_string($_POST['rua']);
    $numero = intval($_POST['numero']);
    $cep = $conn->real_escape_string($_POST['cep']);
    $bairro = $conn->real_escape_string($_POST['cep']);

    // Atualiza o endereço do usuário no banco de dados usando prepared statement
    $sql = "UPDATE enderecos SET rua = ?, numero = ?, cep = ?, bairro = ?, complemento = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sisssi", $rua, $numero, $cep, $cidade, $estado, $id_usuario);

    // Executa a atualização e verifica o resultado
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Endereço atualizado com sucesso.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao atualizar o endereço: ' . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
    exit;
} else {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos!']);
    exit;
};