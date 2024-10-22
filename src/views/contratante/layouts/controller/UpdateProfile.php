<?php
// Inicia a sessão
if (!isset($_SESSION)) {
    session_start();
}

// Verifica se o formulário foi enviado via POST para atualizar o perfil
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['primeiro_nome'], $_POST['ultimo_nome'], $_POST['email'])) {
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
    $id_usuario    = $_SESSION['id_usuario'];
    $primeiro_nome = $conn->real_escape_string(trim($_POST['primeiro_nome']));
    $ultimo_nome   = $conn->real_escape_string(trim($_POST['ultimo_nome']));
    $email         = $conn->real_escape_string(trim($_POST['email']));
    $telefone      = $conn->real_escape_string(trim($_POST['telefone']));
    $celular       = $conn->real_escape_string(trim($_POST['celular']));
    $whatsapp      = $conn->real_escape_string(trim($_POST['whatsapp']));
    $senha         = isset($_POST['senha']) ? trim($_POST['senha']) : null;

    // Validação básica
    if (empty($primeiro_nome) || empty($ultimo_nome) || empty($email)) {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.']);
        exit;
    }

    // Prepara a atualização do perfil no banco de dados usando prepared statement
    $sql = "UPDATE usuarios SET primeiro_nome = ?, ultimo_nome = ?, email = ?, telefone = ?, celular = ?, whatsapp = ?";

    // Se a senha for fornecida, a atualizaremos também
    if (!empty($senha)) {
        $senha_hash = password_hash($senha, PASSWORD_DEFAULT);
        $sql .= ", senha = ?";
    }
    
    // Corrige a cláusula WHERE para usar 'id_usuario'
    $sql .= " WHERE id_usuario = ?"; // Mudei aqui

    // Preparando a consulta
    $stmt = $conn->prepare($sql);
    
    if ($stmt) {
        // Se a senha foi fornecida, vinculamos todos os parâmetros
        if (!empty($senha)) {
            $stmt->bind_param("sssssii", $primeiro_nome, $ultimo_nome, $email, $telefone, $celular, $whatsapp, $senha_hash, $id_usuario);
        } else {
            $stmt->bind_param("ssssssi", $primeiro_nome, $ultimo_nome, $email, $telefone, $celular, $whatsapp, $id_usuario); // Corrigido aqui
        }

        // Executa a atualização e verifica o resultado
        if ($stmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar perfil: ' . $stmt->error]);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'Erro ao preparar a consulta: ' . $conn->error]);
    }

    $conn->close();
    exit;
} else {
    echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios!']);
    exit;
}
