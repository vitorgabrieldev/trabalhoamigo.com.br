<?php
// Inicia a sessão
if (!isset($_SESSION)) {
    session_start();
}

// Verifica se o formulário foi enviado via POST para atualizar o endereço
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['rua'], $_POST['cep'])) {
    header('Content-Type: application/json');

    require_once __DIR__ . '/../../../../../config/config.php';

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
    $id_usuario  = $_SESSION['id_usuario'];
    $rua         = $conn->real_escape_string($_POST['rua']);
    $numero      = intval($_POST['numero']);
    $cep         = $conn->real_escape_string($_POST['cep']);
    $bairro      = $conn->real_escape_string($_POST['bairro']); // Corrige o campo para 'bairro' em vez de 'cep'
    $complemento = $conn->real_escape_string($_POST['complemento']);

    // Atualiza o endereço do usuário no banco de dados usando prepared statement
    $sql = "UPDATE enderecos SET rua = ?, numero = ?, cep = ?, bairro = ?, complemento = ? WHERE id_usuario = ?";
    $stmt = $conn->prepare($sql);

    // Corrige a ordem dos parâmetros, removendo cidade e estado, e adicionando complemento
    $stmt->bind_param("sisssi", $rua, $numero, $cep, $bairro, $complemento, $id_usuario);

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